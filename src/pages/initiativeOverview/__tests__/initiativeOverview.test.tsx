import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import InitiativeOverview from '../InitiativeOverview';


const mockMatchPath = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  matchPath: () => mockMatchPath(),
}));

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

jest.mock('@pagopa/selfcare-common-frontend/hooks/useErrorDispatcher', () => ({
  __esModule: true,
  default: () => jest.fn(),
}));

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <InitiativeOverview />
    </BrowserRouter>
  );
};

describe('InitiativeOverview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMatchPath.mockReturnValue({
      params: { id: 'test-id' }
    });

  });

  describe('Component rendering', () => {
    test('should render the main title and subtitle', () => {
      renderComponent();

      expect(screen.getByText('pages.initiativeOverview.title')).toBeInTheDocument();
      expect(screen.getByText('pages.initiativeOverview.subtitle')).toBeInTheDocument();
    });

    test('should render the information section', () => {
      renderComponent();

      expect(screen.getByText('pages.initiativeOverview.information')).toBeInTheDocument();
      expect(screen.getByText('pages.initiativeOverview.refundsStatusTitle')).toBeInTheDocument();
      expect(screen.getByText('pages.initiativeOverview.totalAmount')).toBeInTheDocument();
      expect(screen.getByText('pages.initiativeOverview.totalRefunded')).toBeInTheDocument();
    });

    test('should render the stores section', () => {
      renderComponent();

      expect(screen.getByText('pages.initiativeOverview.stores')).toBeInTheDocument();
    });

    test('should render IBAN data section', () => {
      renderComponent();

      expect(screen.getByText('pages.initiativeOverview.refundsDataTitle')).toBeInTheDocument();
      expect(screen.getByText('pages.initiativeOverview.holder')).toBeInTheDocument();
      expect(screen.getByText('pages.initiativeOverview.iban')).toBeInTheDocument();
    });
  });

  describe('IBAN Alert', () => {
    test('should show IBAN missing alert when IBAN is missing', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('pages.initiativeOverview.missingIban')).toBeInTheDocument();
      });
    });

    test('should show insert IBAN button in alert', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('pages.initiativeOverview.insertIban')).toBeInTheDocument();
      });
    });
  });

  describe('Success Alert', () => {
    test('should show success alert on component mount', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('pages.initiativeOverview.successIban')).toBeInTheDocument();
      });
    });

    test('should hide success alert after 5 seconds', async () => {
      jest.useFakeTimers();
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('pages.initiativeOverview.successIban')).toBeInTheDocument();
      });

      jest.advanceTimersByTime(5000);

      await waitFor(() => {
        expect(screen.queryByText('pages.initiativeOverview.successIban')).not.toBeInTheDocument();
      });

      jest.useRealTimers();
    });
  });

  describe('Text Input Handling', () => {
    test('should handle IBAN input changes and filter non-alphanumeric characters', () => {
      renderComponent();

      const insertIbanButton = screen.getByTestId('insert-iban-button');
      fireEvent.click(insertIbanButton);

      const ibanInput = screen.getByLabelText('pages.initiativeOverview.insertIban');
      fireEvent.change(ibanInput, { target: { value: 'IT60-X054-2811-101' } });

      expect(ibanInput).toHaveValue('IT60X0542811101');
    });

    test('should handle IBAN holder input changes', () => {
      renderComponent();

      const insertIbanButton = screen.getByTestId('insert-iban-button');
      fireEvent.click(insertIbanButton);

      const holderInput = screen.getByLabelText('pages.initiativeOverview.insertIbanHolder');
      fireEvent.change(holderInput, { target: { value: 'Mario Rossi' } });

      expect(holderInput).toHaveValue('Mario Rossi');
    });

    test('should show character counter for IBAN input', () => {
      renderComponent();

      const insertIbanButton = screen.getByTestId('insert-iban-button');
      fireEvent.click(insertIbanButton);

      expect(screen.getByLabelText('pages.initiativeOverview.insertIban')).toBeInTheDocument();

      const ibanInput = screen.getByLabelText('pages.initiativeOverview.insertIban');
      fireEvent.change(ibanInput, { target: { value: 'IT60X0542811101' } });

      expect(screen.getByText(/\d+\/27/)).toBeInTheDocument();
    });
  });


  describe('Store Button', () => {
    test('should render store button with correct text', () => {
      renderComponent();

      const storeButton = screen.getByTestId('add-stores-button');
      expect(storeButton).toBeInTheDocument();
      expect(storeButton).toHaveTextContent('pages.initiativeOverview.storesSubtitle');
    });
  });
});