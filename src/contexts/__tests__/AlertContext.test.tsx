import { render, screen, waitFor } from "@testing-library/react";
import { AlertProvider } from "../AlertContext";
import { useAlert } from "../../hooks/useAlert";
import { useEffect } from "react";
import Layout from '../../components/Layout/Layout'
import UnloadEventHandler from "@pagopa/selfcare-common-frontend/components/UnloadEventHandler";
import { Provider } from "react-redux";
import { createStore } from "../../redux/store";
import LoadingOverlay from "@pagopa/selfcare-common-frontend/components/Loading/LoadingOverlay";
import UserNotifyHandle from "@pagopa/selfcare-common-frontend/components/UserNotifyHandle";
import AlertComponent from "../../components/Alert/AlertComponent";

const EmptyConsumer = () => {
    const { alert, setAlert } = useAlert();

    useEffect(() => {
        setAlert()
    }, [])

    return <div><AlertComponent data-testid="alert-test" /></div>
}

const Consumer = () => {
    const { alert, setAlert } = useAlert();

    useEffect(() => {
        setAlert({title: 'title', text: 'text', isOpen: true})
    }, [])

    return <div><AlertComponent data-testid="alert-test"/></div>
}

describe('AlertContext', () => {

  it('renders AlertContext with empty values', () => {

    render(
        <AlertProvider>
            <EmptyConsumer />
        </AlertProvider>
    );

    const alert = document.querySelector('[data-testid="alert-test"') as HTMLElement;

    expect(alert).not.toBeInTheDocument()

  });

  it('renders AlertContext with populated state', async () => {

    render(
        <AlertProvider>
            <Consumer />
        </AlertProvider>
    );

    const alert = document.querySelector('[data-testid="alert-test"') as HTMLElement;

    expect(screen.getByText('title')).toBeInTheDocument()
    expect(screen.getByText('text')).toBeInTheDocument()

    await waitFor(() => {
      setTimeout(() => {
        expect(alert).not.toBeInTheDocument()
      }, 5000)
    })

  });
});