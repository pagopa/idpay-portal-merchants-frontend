import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider, useStore } from '../StoreContext';

const TestComponent = () => {
  const { storeId, setStoreId } = useStore();

  return (
    <div>
      <p data-testid="store-id">{storeId}</p>
      <button onClick={() => setStoreId('1234')}>Set Store ID</button>
    </div>
  );
};

describe('StoreProvider', () => {
  test('should provide default empty storeId', () => {
    render(
      <StoreProvider>
        <TestComponent />
      </StoreProvider>
    );

    expect(screen.getByTestId('store-id')).toHaveTextContent('');
  });

  test('should update storeId when setStoreId is called', () => {
    render(
      <StoreProvider>
        <TestComponent />
      </StoreProvider>
    );

    const button = screen.getByRole('button', { name: /Set Store ID/i });
    button.click();

    expect(screen.getByTestId('store-id')).toHaveTextContent('1234');
  });

  test('should throw an error if useStore is used outside of StoreProvider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const FaultyComponent = () => {
      useStore();
      return null;
    };

    expect(() => render(<FaultyComponent />)).toThrow(
      'useStore must be used within a PointOfSaleProvider'
    );

    spy.mockRestore();
  });
});