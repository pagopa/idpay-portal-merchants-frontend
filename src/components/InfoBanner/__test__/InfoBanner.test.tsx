import { fireEvent, render, screen } from "@testing-library/react";
import { InfoBanner } from "../InfoBanner";

describe('InfoBanner', () => {
    it('should render component', () => {
        const mockOnClick = jest.fn();
        render(<InfoBanner description="Test description" severity="success" button={{
            title: "Test button",
            onClick: () => mockOnClick()
        }}/>);

        const btn = screen.getByText('Test button');

        fireEvent.click(btn);

        expect(screen.getByText('Test description')).toBeInTheDocument();
        expect(mockOnClick).toHaveBeenCalled();
    });
});