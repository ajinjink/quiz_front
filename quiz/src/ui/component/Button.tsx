interface ButtonProps {
    text: string,
    onClick: any
}

const Button = ({text, onClick}: ButtonProps) => {
    return (
        <button className="text-gray-600 hover:text-gray-800" onClick={onClick}>
            {text}
        </button>
    )
}

export default Button;