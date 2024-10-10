interface ContainerProps {
    children: React.ReactNode;
}

// FC -> Functional Component
const Container: React.FC<ContainerProps> = ({ children }) => {
    return (
        <div className="
            max-w-3/4
            mx-auto
            xl:px-20
            md:px-2
            px-4
        ">
            {children}
        </div>
    );
}

export default Container;
