import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RefundRequestsModal } from '../RefundRequestModal';

describe('RefundRequestsModal', () => {
  const defaultProps = {
    isOpen: true,
    setIsOpen: jest.fn(),
    title: "Test title",
    description: "Test description",
    descriptionTwo: "Test description two",
    warning: "Test warning",
    cancelBtn: "Test cancel",
    confirmBtn: {
        text: "Test confirm",
        onConfirm: jest.fn()
    }
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the modal when open is true', () => {
      render(<RefundRequestsModal {...defaultProps} />);
      expect(screen.getByTestId("refund-requests-modal-test")).toBeInTheDocument();
      expect(screen.getByText('Test title')).toBeInTheDocument();
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });

    it('should render cancel and confirm buttons', () => {
      render(<RefundRequestsModal {...defaultProps} />);
      expect(screen.getByText("Test cancel")).toBeInTheDocument();
      fireEvent.click(screen.getByText("Test cancel"));
      expect(screen.getByText("Test confirm")).toBeInTheDocument();
      fireEvent.click(screen.getByText("Test confirm"));
    });
  });
});
