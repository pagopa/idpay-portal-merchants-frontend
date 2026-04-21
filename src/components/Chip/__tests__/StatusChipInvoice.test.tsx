import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import StatusChipInvoice from '../StatusChipInvoice';

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  (console.error as jest.Mock).mockRestore();
});
import { RewardBatchTrxStatus } from '../../../api/generated/merchants/data-contracts';

const RewardBatchTrxStatusEnum = {
  TO_CHECK: 'TO_CHECK' as RewardBatchTrxStatus,
  CONSULTABLE: 'CONSULTABLE' as RewardBatchTrxStatus,
  SUSPENDED: 'SUSPENDED' as RewardBatchTrxStatus,
  APPROVED: 'APPROVED' as RewardBatchTrxStatus,
  REJECTED: 'REJECTED' as RewardBatchTrxStatus,
} as const;

type RewardBatchTrxStatusEnum =
  (typeof RewardBatchTrxStatusEnum)[keyof typeof RewardBatchTrxStatusEnum];

jest.mock('../CustomChip', () => {
  return function MockCustomChip({ label, colorChip, sizeChip, textColorChip }: any) {
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
      render(<StatusChipInvoice status={RewardBatchTrxStatusEnum.TO_CHECK as any} />);

      const chip = screen.getByTestId('custom-chip');
      expect(chip).toHaveTextContent('TO_CHECK');
      expect(chip).toHaveAttribute('data-color', '#E0E0E0');
      expect(chip).toHaveAttribute('data-size', 'small');
    });

    it('should render CONSULTABLE status correctly', () => {
      render(<StatusChipInvoice status={RewardBatchTrxStatusEnum.CONSULTABLE as any} />);

      const chip = screen.getByTestId('custom-chip');
      expect(chip).toHaveTextContent('Consultabile');
      expect(chip).toHaveAttribute('data-color', '#E0E0E0');
      expect(chip).toHaveAttribute('data-size', 'small');
    });

    it('should render SUSPENDED status correctly', () => {
      render(<StatusChipInvoice status={RewardBatchTrxStatusEnum.SUSPENDED as any} />);

      const chip = screen.getByTestId('custom-chip');
      expect(chip).toHaveTextContent('Da controllare');
      expect(chip).toHaveAttribute('data-color', '#E0E0E0');
      expect(chip).toHaveAttribute('data-size', 'small');
    });

    it('should render APPROVED status correctly', () => {
      render(<StatusChipInvoice status={RewardBatchTrxStatusEnum.APPROVED as any} />);

      const chip = screen.getByTestId('custom-chip');
      expect(chip).toHaveTextContent('Approvata');
      expect(chip).toHaveAttribute('data-color', '#E0E0E0');
      expect(chip).toHaveAttribute('data-size', 'small');
    });

    it('should render REJECTED status correctly with custom text color', () => {
      render(<StatusChipInvoice status={RewardBatchTrxStatusEnum.REJECTED as any} />);

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
      render(<StatusChipInvoice status={unknownStatus as any} />);

      const chip = screen.getByTestId('custom-chip');
      expect(chip).toHaveTextContent('UNKNOWN_STATUS');
      expect(chip).toHaveAttribute('data-color', '#E0E0E0');
      expect(chip).toHaveAttribute('data-size', 'small');
    });
  });

  describe('Props validation', () => {
    it('should always pass size as "small" to CustomChip', () => {
      render(<StatusChipInvoice status={RewardBatchTrxStatusEnum.APPROVED as any} />);

      const chip = screen.getByTestId('custom-chip');
      expect(chip).toHaveAttribute('data-size', 'small');
    });

    it('should pass textColor only when defined in statusMap', () => {
      const { rerender } = render(
        <StatusChipInvoice status={RewardBatchTrxStatusEnum.TO_CHECK as any} />
      );

      let chip = screen.getByTestId('custom-chip');
      expect(chip).toBeInTheDocument();
      expect(chip).not.toHaveAttribute('data-text-color');

      rerender(<StatusChipInvoice status={RewardBatchTrxStatusEnum.APPROVED as any} />);
      chip = screen.getByTestId('custom-chip');
      expect(chip).toHaveAttribute('data-text-color', '#215C76');
    });
  });
});
