import { FunctionComponent } from 'react';
import ReactDOM from 'react-dom';

export const Portal: FunctionComponent<React.PropsWithChildren> = (props) => {
  return ReactDOM.createPortal(
    props.children,
    document.querySelector('#portal')
  );
};
