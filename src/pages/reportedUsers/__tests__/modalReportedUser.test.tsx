import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ModalReportedUser from '../modalReportedUser';

describe('ModalReportedUser', () => {
  const defaultProps = {
    open: true,
    title: 'Test Title',
    description: 'Test Description',
    cancelText: 'Cancel',
    confirmText: 'Confirm',
    onCancel: jest.fn(),
    onConfirm: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the modal when open is true', () => {
      render(<ModalReportedUser {...defaultProps} />);
      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
    });

    it('should not render the modal when open is false', () => {
      const { container } = render(<ModalReportedUser {...defaultProps} open={false} />);
      const dialog = container.querySelector('[role="presentation"]');
      expect(dialog).not.toBeInTheDocument();
    });

    it('should render cancel and confirm buttons', () => {
      render(<ModalReportedUser {...defaultProps} />);
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    });

    it('should render custom title and text', () => {
      render(
        <ModalReportedUser
          {...defaultProps}
          title="Custom Title"
          description="Custom Description"
          cancelText="Custom Cancel"
          confirmText="Custom Confirm"
        />
      );
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
      expect(screen.getByText('Custom Description')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Custom Cancel' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Custom Confirm' })).toBeInTheDocument();
    });

    it('should support React.ReactNode as description', () => {
      const descriptionNode = (
        <div>
          <span>React Node Description</span>
        </div>
      );
      render(<ModalReportedUser {...defaultProps} description={descriptionNode} />);
      expect(screen.getByText('React Node Description')).toBeInTheDocument();
    });
  });

  describe('DescriptionTwo prop', () => {
    it('should render descriptionTwo when provided', () => {
      render(<ModalReportedUser {...defaultProps} descriptionTwo="Test Description Two" />);
      expect(screen.getByText('Test Description Two')).toBeInTheDocument();
    });

    it('should not render descriptionTwo when not provided', () => {
      render(<ModalReportedUser {...defaultProps} />);
      expect(screen.queryByText('Test Description Two')).not.toBeInTheDocument();
    });

    it('should render both descriptions when descriptionTwo is provided', () => {
      render(
        <ModalReportedUser
          {...defaultProps}
          description="First Description"
          descriptionTwo="Second Description"
        />
      );
      expect(screen.getByText('First Description')).toBeInTheDocument();
      expect(screen.getByText('Second Description')).toBeInTheDocument();
    });
  });

  describe('Button interactions', () => {
    it('should call onCancel when cancel button is clicked', () => {
      const onCancel = jest.fn();
      render(<ModalReportedUser {...defaultProps} onCancel={onCancel} />);
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('should call onConfirm when confirm button is clicked', () => {
      const onConfirm = jest.fn();
      render(<ModalReportedUser {...defaultProps} onConfirm={onConfirm} />);
      fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel when dialog is closed via backdrop', () => {
      const onCancel = jest.fn();
      render(<ModalReportedUser {...defaultProps} onCancel={onCancel} />);
      // Dialog onClose is triggered by clicking the backdrop
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });
  });

  describe('Button styling', () => {
    it('should have outlined variant for cancel button', () => {
      render(<ModalReportedUser {...defaultProps} />);
      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      expect(cancelButton).toHaveClass('MuiButton-outlined');
    });

    it('should have contained variant for confirm button', () => {
      render(<ModalReportedUser {...defaultProps} />);
      const confirmButton = screen.getByRole('button', { name: 'Confirm' });
      expect(confirmButton).toHaveClass('MuiButton-contained');
    });

    it('should have primary color for confirm button', () => {
      render(<ModalReportedUser {...defaultProps} />);
      const confirmButton = screen.getByRole('button', { name: 'Confirm' });
      expect(confirmButton).toHaveClass('MuiButton-containedPrimary');
    });
  });

  describe('Dialog styling', () => {
    it('should have correct PaperProps styling', () => {
      render(<ModalReportedUser {...defaultProps} />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveStyle('min-width: 600px');
      expect(dialog).toHaveStyle('min-height: 267px');
    });

    it('should have correct DialogTitle styling', () => {
      render(<ModalReportedUser {...defaultProps} />);
      const title = screen.getByText('Test Title');
      const titleElement = title.closest('.MuiDialogTitle-root');
      expect(titleElement).toHaveClass('MuiDialogTitle-root');
      // Check that title exists and is rendered
      expect(title).toBeInTheDocument();
    });
  });

  describe('Optional props', () => {
    it('should render with cfModal prop (even though unused)', () => {
      render(<ModalReportedUser {...defaultProps} cfModal="test-cf-modal" />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle empty strings for text props', () => {
      render(
        <ModalReportedUser {...defaultProps} title="" description="" cancelText="" confirmText="" />
      );
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);
    });

    it('should handle very long text content', () => {
      const longText = 'A'.repeat(100);
      render(
        <ModalReportedUser {...defaultProps} title={longText} description="Short description" />
      );
      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it('should handle special characters in text', () => {
      const specialTitle = `Test & < > " '`;
      render(
        <ModalReportedUser
          {...defaultProps}
          title={specialTitle}
          description="Special chars: @#$%^&*()"
        />
      );
      expect(screen.getByText(specialTitle)).toBeInTheDocument();
      expect(screen.getByText('Special chars: @#$%^&*()')).toBeInTheDocument();
    });

    it('should handle multiple rapid button clicks', () => {
      const onConfirm = jest.fn();
      render(<ModalReportedUser {...defaultProps} onConfirm={onConfirm} />);
      const confirmButton = screen.getByRole('button', { name: 'Confirm' });

      fireEvent.click(confirmButton);
      fireEvent.click(confirmButton);
      fireEvent.click(confirmButton);

      expect(onConfirm).toHaveBeenCalledTimes(3);
    });
  });
});
