import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import NewDiscount from '../newDiscount';

const mockUseCurrentInitiativeId = jest.fn();
jest.mock('../../../hooks/useCurrentInitiativeId', () => ({
  useCurrentInitiativeId: () => mockUseCurrentInitiativeId(),
}));

const mockUseCurrentInitiative = jest.fn();
jest.mock('../../../hooks/useCurrentInitiative', () => ({
  useCurrentInitiative: () => mockUseCurrentInitiative(),
}));

jest.mock('@pagopa/selfcare-common-frontend/lib', () => ({
  TitleBox: (props: any) => (
    <div>
      <div data-testid="title">{props.title}</div>
      <div data-testid="subtitle">{props.subTitle}</div>
    </div>
  ),
}));

jest.mock('../../components/BreadcrumbsBox', () => () => <div data-testid="breadcrumbs" />);

const mockCreateForm = jest.fn();
jest.mock('../CreateForm', () => (props: any) => {
  mockCreateForm(props);
  return <div data-testid="create-form" />;
});

const mockDiscountRecap = jest.fn();
jest.mock('../DiscountCreatedRecap', () => (props: any) => {
  mockDiscountRecap(props);
  return <div data-testid="discount-recap" />;
});

describe('NewDiscount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCurrentInitiative.mockReturnValue({ initiativeName: 'Init name' });
  });

  it('returns null when initiativeId is missing', () => {
    mockUseCurrentInitiativeId.mockReturnValue({
      initiativeId: undefined,
      isValid: true,
      isListLoaded: true,
    });

    const { container } = render(<NewDiscount />);
    expect(container.firstChild).toBeNull();
  });

  it('renders CreateForm when discount is not created', () => {
    mockUseCurrentInitiativeId.mockReturnValue({
      initiativeId: 'init-1',
      isValid: true,
      isListLoaded: true,
    });

    render(<NewDiscount />);

    expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
    expect(screen.getByTestId('create-form')).toBeInTheDocument();
    expect(screen.getByTestId('title')).toHaveTextContent('pages.newDiscount.title');
    expect(screen.getByTestId('subtitle')).toHaveTextContent('pages.newDiscount.subtitle');

    expect(mockCreateForm).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'init-1',
        setDiscountCreated: expect.any(Function),
        setDiscountResponse: expect.any(Function),
      })
    );
  });

  it('renders DiscountCreatedRecap when discount is created', () => {
    mockUseCurrentInitiativeId.mockReturnValue({
      initiativeId: 'init-1',
      isValid: true,
      isListLoaded: true,
    });

    jest.spyOn(React, 'useState').mockImplementationOnce(() => [true, jest.fn()] as any);
    jest
      .spyOn(React, 'useState')
      .mockImplementationOnce(() => [{ id: 'trx' } as any, jest.fn()] as any);

    render(<NewDiscount />);

    expect(screen.getByTestId('discount-recap')).toBeInTheDocument();
    expect(screen.getByTestId('title')).toHaveTextContent('pages.newDiscount.createdTitle');
    expect(screen.getByTestId('subtitle')).toHaveTextContent('pages.newDiscount.createdSubtitle');

    expect(mockDiscountRecap).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { id: 'trx' },
      })
    );
  });
});
