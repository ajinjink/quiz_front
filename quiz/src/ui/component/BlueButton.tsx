interface ButtonProps {
    text: string,
    onClick: any
}

const BlueButton = ({text, onClick}: ButtonProps) => {
    return (
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" onClick={onClick}>
            {text}
        </button>
    )
}

export default BlueButton;