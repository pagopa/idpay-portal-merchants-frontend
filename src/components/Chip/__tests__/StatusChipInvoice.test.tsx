import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import StatusChipInvoice from '../StatusChipInvoice';
import { RewardBatchTrxStatusEnum } from '../../../api/generated/merchants/RewardBatchTrxStatus';

jest.mock('../CustomChip', () => {
  return function MockCustomChip({
                                   label,
                                   colorChip,
                                   sizeChip,
                                   textColorChip
                                 }: any) {
    return (
      <div
        data-testid="custom-chip"
        data-label={label}
        data-color={colorChip}
        data-size={sizeChip}
        data-text-color={textColorChip}
      >
        {label}
      </div>
    );
  };
});

describe('StatusChipInvoice', () => {
  describe('Status rendering', () => {
    it('should render TO_CHECK status correctly', () => {
      render(<StatusChipInvoice status={RewardBatchTrxStatusEnum.TO_CHECK} />);

      const chip = screen.getByTestId('custom-chip');
      expect(chip).toHaveTextContent('Da esaminare');
      expect(chip).toHaveAttribute('data-color', '#EEEEEE');
      expect(chip).toHaveAttribute('data-size', 'small');
    });

    it('should render CONSULTABLE status correctly', () => {
      render(<StatusChipInvoice status={RewardBatchTrxStatusEnum.CONSULTABLE} />);

      const chip = screen.getByTestId('custom-chip');
      expect(chip).toHaveTextContent('Consultabile');
      expect(chip).toHaveAttribute('data-color', '#EEEEEE');
      expect(chip).toHaveAttribute('data-size', 'small');
    });

    it('should render SUSPENDED status correctly', () => {
      render(<StatusChipInvoice status={RewardBatchTrxStatusEnum.SUSPENDED} />);

      const chip = screen.getByTestId('custom-chip');
      expect(chip).toHaveTextContent('Da controllare');
      expect(chip).toHaveAttribute('data-color', '#FFF5DA');
      expect(chip).toHaveAttribute('data-size', 'small');
    });

    it('should render APPROVED status correctly with custom text color', () => {
      render(<StatusChipInvoice status={RewardBatchTrxStatusEnum.APPROVED} />);

      const chip = screen.getByTestId('custom-chip');
      expect(chip).toHaveTextContent('Approvata');
      expect(chip).toHaveAttribute('data-color', '#E1F5FE');
      expect(chip).toHaveAttribute('data-text-color', '#215C76');
      expect(chip).toHaveAttribute('data-size', 'small');
    });

    it('should render REJECTED status correctly with custom text color', () => {
      render(<StatusChipInvoice status={RewardBatchTrxStatusEnum.REJECTED} />);

      const chip = screen.getByTestId('custom-chip');
      expect(chip).toHaveTextContent('Esclusa');
      expect(chip).toHaveAttribute('data-color', '#FFE0E0');
      expect(chip).toHaveAttribute('data-text-color', '#761F1F');
      expect(chip).toHaveAttribute('data-size', 'small');
    });
  });

  describe('Edge cases', () => {
    it('should handle unknown status gracefully', () => {
      const unknownStatus = 'UNKNOWN_STATUS' as RewardBatchTrxStatusEnum;
      render(<StatusChipInvoice status={unknownStatus} />);

      const chip = screen.getByTestId('custom-chip');
      expect(chip).toHaveTextContent('UNKNOWN_STATUS');
      expect(chip).toHaveAttribute('data-color', '#E0E0E0');
      expect(chip).toHaveAttribute('data-size', 'small');
    });
  });

  describe('Props validation', () => {
    it('should always pass size as "small" to CustomChip', () => {
      render(<StatusChipInvoice status={RewardBatchTrxStatusEnum.APPROVED} />);

      const chip = screen.getByTestId('custom-chip');
      expect(chip).toHaveAttribute('data-size', 'small');
    });

    it('should pass textColor only when defined in statusMap', () => {
      const { rerender } = render(
        <StatusChipInvoice status={RewardBatchTrxStatusEnum.TO_CHECK} />
      );

      let chip = screen.getByTestId('custom-chip');
      expect(chip).toBeInTheDocument();

      rerender(<StatusChipInvoice status={RewardBatchTrxStatusEnum.APPROVED} />);
      chip = screen.getByTestId('custom-chip');
      expect(chip).toHaveAttribute('data-text-color', '#215C76');
    });
  });

  describe('Snapshot tests', () => {
    it('should match snapshot for all status types', () => {
      const statuses = [
        RewardBatchTrxStatusEnum.TO_CHECK,
        RewardBatchTrxStatusEnum.CONSULTABLE,
        RewardBatchTrxStatusEnum.SUSPENDED,
        RewardBatchTrxStatusEnum.APPROVED,
        RewardBatchTrxStatusEnum.REJECTED,
      ];

      statuses.forEach(status => {
        const { container } = render(<StatusChipInvoice status={status} />);
        expect(container).toMatchSnapshot(`status-${status}`);
      });
    });
  });
});