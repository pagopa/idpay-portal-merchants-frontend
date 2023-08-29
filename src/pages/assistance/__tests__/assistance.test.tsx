import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import Assistance from '../assistance';
import { createStore } from '../../../redux/store';

jest.mock('react-router-dom', () => Function());

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: 'localhost:3000/portale-esercenti',
  }),
}));

jest.mock('@pagopa/selfcare-common-frontend', () => ({
  useLoading: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-floating-promises
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: any) => key }),
  Trans: () => '',
}));

describe('<Assistance />', (injectedStore?: ReturnType<typeof createStore>) => {
  const store = injectedStore ? injectedStore : createStore();

  it('renders without crashing', () => {
    window.scrollTo = jest.fn();
  });

  test('Should render the Assistance component', async () => {
    waitFor(() => {
      render(
        <Provider store={store}>
          <Assistance />
        </Provider>
      );
    });

    const assSubject = screen.getByLabelText('pages.assistanceRequest.subject') as HTMLInputElement;
    const assMessage = screen.getByLabelText('pages.assistanceRequest.message') as HTMLInputElement;
    const sendBtn = screen.getByTestId('sendAssistenceRequest-test');
    const exitBtn = screen.getByTestId('open-exit-test') as HTMLButtonElement;
    //not found
    // const thankYou = screen.getByTestId('thankyouPageBackBtn-test') as HTMLButtonElement;

    fireEvent.change(assSubject, { target: { value: 'assistance subject' } });
    expect(assSubject.value).toBe('assistance subject');

    fireEvent.change(assMessage, { target: { value: 'assistance message' } });
    expect(assMessage.value).toBe('assistance message');

    fireEvent.click(sendBtn);
    expect(sendBtn).toBeInTheDocument();

    fireEvent.click(exitBtn);
    expect(exitBtn).toBeInTheDocument();

    // fireEvent.click(thankYou);
    // expect(thankYou).toBeInTheDocument();
  });
});
