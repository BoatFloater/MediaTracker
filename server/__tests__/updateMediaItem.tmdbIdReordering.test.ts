import { clearDatabase, runMigrations } from '__tests__/__utils__/utils';
import { Database } from 'src/dbconfig';
import {
  MediaItemBase,
  MediaItemForProvider,
  TvEpisodeForProvider,
  TvSeasonForProvider,
} from 'src/entity/mediaItem';
import { MetadataProvider } from 'src/metadata/metadataProvider';
import { metadataProviders } from 'src/metadata/metadataProviders';
import { updateMediaItem } from 'src/updateMetadata';

jest.mock('src/metadata/metadataProviders');

const mockedMetadataProviders = metadataProviders as jest.Mocked<
  typeof metadataProviders
>;

const user = {
  id: 1,
  name: 'admin',
  admin: true,
  password: 'password',
  publicReviews: false,
};

const tvShow: MediaItemBase = {
  id: 1,
  lastTimeUpdated: new Date('2024-01-01').getTime(),
  mediaType: 'tv',
  source: 'tmdb',
  title: 'Show',
  runtime: 40,
  tmdbId: 9000,
};

type LocalEpisode = {
  id: number;
  episodeNumber: number;
  tmdbId: number;
  title?: string;
};

type LocalSeason = {
  id: number;
  seasonNumber: number;
  tmdbId: number;
  episodes: LocalEpisode[];
};

type ProviderEpisode = {
  episodeNumber: number;
  tmdbId: number;
  title?: string;
};

type ProviderSeason = {
  seasonNumber: number;
  tmdbId: number;
  episodes: ProviderEpisode[];
};

const setupLocalData = async (seasons: LocalSeason[]) => {
  await Database.knex('mediaItem').insert(tvShow);

  for (const season of seasons) {
    await Database.knex('season').insert({
      id: season.id,
      seasonNumber: season.seasonNumber,
      tmdbId: season.tmdbId,
      title: `Season ${season.seasonNumber}`,
      isSpecialSeason: false,
      tvShowId: tvShow.id,
      numberOfEpisodes: season.episodes.length,
    });

    for (const episode of season.episodes) {
      await Database.knex('episode').insert({
        id: episode.id,
        episodeNumber: episode.episodeNumber,
        seasonNumber: season.seasonNumber,
        seasonAndEpisodeNumber:
          season.seasonNumber * 1000 + episode.episodeNumber,
        title: episode.title ?? `Episode ${episode.episodeNumber}`,
        isSpecialEpisode: false,
        tvShowId: tvShow.id,
        seasonId: season.id,
        tmdbId: episode.tmdbId,
      });
    }
  }
};

const mockProvider = (seasons: ProviderSeason[]) => {
  const details: MediaItemForProvider = {
    mediaType: 'tv',
    source: 'tmdb',
    title: 'Show (updated)',
    runtime: 41,
    tmdbId: tvShow.tmdbId,
    seasons: seasons.map<TvSeasonForProvider>((season) => ({
      seasonNumber: season.seasonNumber,
      tmdbId: season.tmdbId,
      title: `Season ${season.seasonNumber}`,
      numberOfEpisodes: season.episodes.length,
      isSpecialSeason: false,
      episodes: season.episodes.map<TvEpisodeForProvider>((episode) => ({
        episodeNumber: episode.episodeNumber,
        seasonNumber: season.seasonNumber,
        title: episode.title ?? `Episode ${episode.episodeNumber}`,
        isSpecialEpisode: false,
        tmdbId: episode.tmdbId,
      })),
    })),
  };

  mockedMetadataProviders.get.mockReturnValue({
    details: async () => details,
  } as unknown as MetadataProvider);
};

const getEpisodes = async () =>
  await Database.knex('episode')
    .where('tvShowId', tvShow.id)
    .orderBy('id', 'asc');

const getSeasons = async () =>
  await Database.knex('season')
    .where('tvShowId', tvShow.id)
    .orderBy('id', 'asc');

describe('updateMediaItem with reordered tmdb ids', () => {
  beforeAll(async () => {
    await runMigrations();
  });

  afterAll(clearDatabase);

  beforeEach(async () => {
    await Database.knex('seen').delete();
    await Database.knex('episode').delete();
    await Database.knex('season').delete();
    await Database.knex('mediaItem').delete();
    await Database.knex('user').delete();
    await Database.knex('user').insert(user);
    mockedMetadataProviders.get.mockReset();
  });

  test('swaps tmdb ids between two episodes and keeps seen history on the slot', async () => {
    await setupLocalData([
      {
        id: 1,
        seasonNumber: 1,
        tmdbId: 5001,
        episodes: [
          { id: 1, episodeNumber: 1, tmdbId: 101, title: 'Slot 1' },
          { id: 2, episodeNumber: 2, tmdbId: 102, title: 'Slot 2' },
        ],
      },
    ]);

    await Database.knex('seen').insert({
      userId: user.id,
      mediaItemId: tvShow.id,
      episodeId: 1,
    });

    mockProvider([
      {
        seasonNumber: 1,
        tmdbId: 5001,
        episodes: [
          { episodeNumber: 1, tmdbId: 102, title: 'New slot 1' },
          { episodeNumber: 2, tmdbId: 101, title: 'New slot 2' },
        ],
      },
    ]);

    await updateMediaItem(tvShow);

    const episodes = await getEpisodes();

    expect(episodes).toEqual([
      expect.objectContaining({
        id: 1,
        episodeNumber: 1,
        tmdbId: 102,
        title: 'New slot 1',
      }),
      expect.objectContaining({
        id: 2,
        episodeNumber: 2,
        tmdbId: 101,
        title: 'New slot 2',
      }),
    ]);

    const seen = await Database.knex('seen');
    expect(seen).toEqual([
      expect.objectContaining({ episodeId: 1, mediaItemId: tvShow.id }),
    ]);
  });

  test('rotates tmdb ids between three episodes', async () => {
    await setupLocalData([
      {
        id: 1,
        seasonNumber: 1,
        tmdbId: 5001,
        episodes: [
          { id: 1, episodeNumber: 1, tmdbId: 101 },
          { id: 2, episodeNumber: 2, tmdbId: 102 },
          { id: 3, episodeNumber: 3, tmdbId: 103 },
        ],
      },
    ]);

    mockProvider([
      {
        seasonNumber: 1,
        tmdbId: 5001,
        episodes: [
          { episodeNumber: 1, tmdbId: 102 },
          { episodeNumber: 2, tmdbId: 103 },
          { episodeNumber: 3, tmdbId: 101 },
        ],
      },
    ]);

    await updateMediaItem(tvShow);

    const episodes = await getEpisodes();

    expect(episodes.map(({ id, tmdbId }) => ({ id, tmdbId }))).toEqual([
      { id: 1, tmdbId: 102 },
      { id: 2, tmdbId: 103 },
      { id: 3, tmdbId: 101 },
    ]);
  });

  test('inserts a new episode with a tmdb id still held by another local episode', async () => {
    await setupLocalData([
      {
        id: 1,
        seasonNumber: 1,
        tmdbId: 5001,
        episodes: [
          { id: 1, episodeNumber: 1, tmdbId: 101 },
          { id: 2, episodeNumber: 3, tmdbId: 103 },
        ],
      },
    ]);

    mockProvider([
      {
        seasonNumber: 1,
        tmdbId: 5001,
        episodes: [
          { episodeNumber: 1, tmdbId: 101 },
          { episodeNumber: 2, tmdbId: 103 },
          { episodeNumber: 3, tmdbId: 303 },
        ],
      },
    ]);

    await updateMediaItem(tvShow);

    const byEpisodeNumber = Object.fromEntries(
      (await getEpisodes()).map((episode) => [episode.episodeNumber, episode])
    );

    expect(byEpisodeNumber[1]).toEqual(
      expect.objectContaining({ id: 1, tmdbId: 101 })
    );
    expect(byEpisodeNumber[3]).toEqual(
      expect.objectContaining({ id: 2, tmdbId: 303 })
    );
    expect(byEpisodeNumber[2]).toEqual(
      expect.objectContaining({ tmdbId: 103 })
    );
    expect(byEpisodeNumber[2].id).not.toEqual(1);
    expect(byEpisodeNumber[2].id).not.toEqual(2);
  });

  test('swaps tmdb ids between two seasons', async () => {
    await setupLocalData([
      {
        id: 1,
        seasonNumber: 1,
        tmdbId: 5001,
        episodes: [{ id: 1, episodeNumber: 1, tmdbId: 101 }],
      },
      {
        id: 2,
        seasonNumber: 2,
        tmdbId: 5002,
        episodes: [{ id: 2, episodeNumber: 1, tmdbId: 201 }],
      },
    ]);

    mockProvider([
      {
        seasonNumber: 1,
        tmdbId: 5002,
        episodes: [{ episodeNumber: 1, tmdbId: 101 }],
      },
      {
        seasonNumber: 2,
        tmdbId: 5001,
        episodes: [{ episodeNumber: 1, tmdbId: 201 }],
      },
    ]);

    await updateMediaItem(tvShow);

    const seasons = await getSeasons();

    expect(seasons.map(({ id, tmdbId }) => ({ id, tmdbId }))).toEqual([
      { id: 1, tmdbId: 5002 },
      { id: 2, tmdbId: 5001 },
    ]);
  });

  test('rolls back and keeps the previous state when the new data has duplicates', async () => {
    await setupLocalData([
      {
        id: 1,
        seasonNumber: 1,
        tmdbId: 5001,
        episodes: [
          { id: 1, episodeNumber: 1, tmdbId: 101 },
          { id: 2, episodeNumber: 2, tmdbId: 102 },
        ],
      },
    ]);

    mockProvider([
      {
        seasonNumber: 1,
        tmdbId: 5001,
        episodes: [
          { episodeNumber: 1, tmdbId: 555 },
          { episodeNumber: 2, tmdbId: 555 },
        ],
      },
    ]);

    let error: unknown;
    try {
      await updateMediaItem(tvShow);
    } catch (caughtError) {
      error = caughtError;
    }

    // better-sqlite3's SqliteError is not always an `instanceof Error` here
    // (realm mismatch), so assert on its string representation.
    expect(String(error)).toContain('UNIQUE constraint failed');

    const episodes = await getEpisodes();
    expect(episodes).toEqual([
      expect.objectContaining({
        id: 1,
        episodeNumber: 1,
        tmdbId: 101,
        title: 'Episode 1',
      }),
      expect.objectContaining({
        id: 2,
        episodeNumber: 2,
        tmdbId: 102,
        title: 'Episode 2',
      }),
    ]);

    const mediaItem = await Database.knex('mediaItem')
      .where({ id: tvShow.id })
      .first();

    expect(mediaItem.title).toEqual(tvShow.title);
  });
});
