import React from 'react';
import { shallow, render, mount } from 'enzyme';
import Decks from './Decks';

describe('Decks', () => {
  let props;
  let shallowDecks;
  let renderedDecks;
  let mountedDecks;

  const shallowTestComponent = () => {
    if (!shallowDecks) {
      shallowDecks = shallow(<Decks {...props} />);
    }
    return shallowDecks;
  };

  const renderTestComponent = () => {
    if (!renderedDecks) {
      renderedDecks = render(<Decks {...props} />);
    }
    return renderedDecks;
  };

  const mountTestComponent = () => {
    if (!mountedDecks) {
      mountedDecks = mount(<Decks {...props} />);
    }
    return mountedDecks;
  };  

  beforeEach(() => {
    props = {};
    shallowDecks = undefined;
    renderedDecks = undefined;
    mountedDecks = undefined;
  });

  // Shallow / unit tests begin here
 
  // Render / mount / integration tests begin here
  
});
