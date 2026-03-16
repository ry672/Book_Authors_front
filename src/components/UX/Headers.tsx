interface IHeadersProps {
    headerType: string;
    headerText: string;
    className?: string;
}

export const Headers = ({ headerType, headerText, className}: IHeadersProps) => {
    const renderHeader = () => {
        switch (headerType) {
            case "h1":
                return <h1 className={className}>{headerText}</h1>;
            case "h2":
                return <h2 className={className}>{headerText}</h2>;
            case "h3":
                return <h3 className={className}>{headerText}</h3>;
           
            case "h4":
                return <h4 className={className}>{headerText}</h4>;
            case "h5":
                return <h5 className={className}>{headerText}</h5>;
            case "h6":
                return <h6 className={className}>{headerText}</h6>;
        }

    };
    return renderHeader();

};