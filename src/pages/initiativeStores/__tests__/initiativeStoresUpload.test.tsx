import { render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import InitiativeStoresUpload from '../InitiativeStoresUpload';
import { BrowserRouter } from 'react-router-dom';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: 'it',
      changeLanguage: jest.fn(),
    },
  }),
  withTranslation: () => (Component: any) => Component,
}));

const renderComponent = () =>
  render(
    <BrowserRouter>
        <InitiativeStoresUpload />
    </BrowserRouter>
  );

describe('InitiativeStoresUpload Component', () => {
  // test('renders  radio buttons', () => {
  //   renderComponent();
  //
  //   expect(screen.getByLabelText(/upload csv/i)).toBeInTheDocument();
  //   expect(screen.getByLabelText(/enter manually/i)).toBeInTheDocument();
  // });

  // test('default selected radio is CSV and CSV box is visible', () => {
  //   renderComponent();
  //
  //   const csvRadio = screen.getByLabelText(/upload csv/i) as HTMLInputElement;
  //   expect(csvRadio.checked).toBe(true);
  //
  //   expect(screen.getByText(/drag.*csv/i)).toBeInTheDocument();
  // });

  // test('switching to manual hides CSV box', () => {
  //   renderComponent();
  //
  //   const manualRadio = screen.getByLabelText(/enter manually/i);
  //   fireEvent.click(manualRadio);
  //
  //   expect(manualRadio).toBeChecked();
  //   expect(screen.queryByText(/drag.*csv/i)).not.toBeInTheDocument();
  // });

  test('renders confirm and back buttons', () => {
    renderComponent();

    const backStoreButton = screen.getByTestId('back-stores-button');
    expect(backStoreButton).toBeInTheDocument()
    const confirmStoreButton = screen.getByTestId('confirm-stores-button');
    expect(confirmStoreButton).toBeInTheDocument();

  });
});