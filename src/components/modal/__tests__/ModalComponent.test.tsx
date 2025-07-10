import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import ModalComponent from '../ModalComponent'; 

describe('ModalComponent', () => {

  // Test 1: La modale non deve essere visibile quando `open` è false
  test('should not render the modal when open prop is false', () => {
    render(
      <ModalComponent open={false} onClose={() => {}}>
        <div>Contenuto del test</div>
      </ModalComponent>
    );

    expect(screen.queryByText(/Contenuto del test/i)).not.toBeInTheDocument();
  });

  // Test 2: La modale deve essere visibile e mostrare i children quando `open` è true
  test('should render the modal and its children when open prop is true', () => {
    render(
      <ModalComponent open={true} onClose={() => {}}>
        <div>Contenuto visibile nella modale</div>
      </ModalComponent>
    );

    expect(screen.getByText(/Contenuto visibile nella modale/i)).toBeInTheDocument();

  });

  // Test 3: Chiamata alla funzione onClose quando la modale viene chiusa
  test('should call onClose when the modal is closed', () => {
    const handleCloseMock = jest.fn();

    render(
      <ModalComponent open={true} onClose={handleCloseMock}>
        <div>Contenuto</div>
      </ModalComponent>
    );

    fireEvent.keyDown(screen.getByRole('presentation'), { key: 'Escape', code: 'Escape' });

    expect(handleCloseMock).toHaveBeenCalledTimes(1);
  });

  // Test 4: Applicazione dello stile personalizzato
  test('should apply custom style when provided', () => {
    const customStyle: React.CSSProperties = {
      backgroundColor: 'rgb(255, 0, 0)', 
      padding: '20px',
    };

     render(
      <ModalComponent open={true} onClose={() => {}} style={customStyle}>
        <div>Contenuto con stile</div>
      </ModalComponent>
    );

    const modalBox = screen.getByTestId('iban-modal-content');

    expect(modalBox).toHaveStyle('background-color: rgb(255, 0, 0)');
    expect(modalBox).toHaveStyle('padding: 20px');
  });

  // Test 5: Applicazione dello stile predefinito se nessun custom style è fornito
  test('should apply default style when no custom style is provided', () => {
    render(
      <ModalComponent open={true} onClose={() => {}}>
        <div>Contenuto predefinito</div>
      </ModalComponent>
    );

    const modalBox = screen.getByTestId('iban-modal-content');
    expect(modalBox).toHaveStyle('width: 600px');

  });
});