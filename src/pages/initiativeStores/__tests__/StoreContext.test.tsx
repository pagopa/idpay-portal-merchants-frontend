import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider, useStore } from '../StoreContext';


// ✅ Componente di test interno per verificare il comportamento dell'hook
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

    // Controlla che il valore iniziale sia una stringa vuota
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
    // Disabilita l'errore React in console per evitare rumore nel log
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