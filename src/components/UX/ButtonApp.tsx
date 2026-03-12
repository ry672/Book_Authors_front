interface ButtonProps {
    buttonType: "submit"| "button"|"reset";
    buttonText: string;
    className: string;
    disabled?: boolean;
}
export const ButtonApp = ({buttonText, buttonType, className, disabled= false}: ButtonProps) => {
    return (
        <button type={buttonType} className={className} disabled={disabled}>{buttonText}</button>
    )

}