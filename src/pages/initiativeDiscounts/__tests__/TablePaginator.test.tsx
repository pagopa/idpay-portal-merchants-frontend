import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TablePaginator from '../TablePaginator';

describe('TablePaginator', () => {
  it('renderizza il componente con i valori passati', () => {
    const setPageMock = jest.fn();

    render(
      <TablePaginator
        page={0}
        setPage={setPageMock}
        totalElements={25}
        rowsPerPage={10}
      />
    );

    const nextButton = screen.getByTitle('Vai alla pagina successiva');
    expect(nextButton).toBeInTheDocument();
  });

  it('chiama setPage con il valore corretto quando si clicca su "pagina successiva"', () => {
    const setPageMock = jest.fn();

    render(
      <TablePaginator
        page={0}
        setPage={setPageMock}
        totalElements={20}
        rowsPerPage={10}
      />
    );

    const nextButton = screen.getByTitle('Vai alla pagina successiva');
    fireEvent.click(nextButton);

    expect(setPageMock).toHaveBeenCalledTimes(1);
    expect(setPageMock).toHaveBeenCalledWith(1);
  });

  it('disabilita il pulsante "pagina successiva" quando è già sull’ultima pagina', () => {
    const setPageMock = jest.fn();

    render(
      <TablePaginator
        page={1}
        setPage={setPageMock}
        totalElements={20}
        rowsPerPage={10}
      />
    );

    const nextButton = screen.getByTitle('Vai alla pagina successiva');
    expect(nextButton).toBeDisabled();
  });
});
