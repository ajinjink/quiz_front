const Logo = () => {
    return (
        <div className="flex items-center space-x-2">
            <div className="w-10 h-10">
                <svg
                    viewBox="0 0 24 24"
                    className="w-full h-full text-blue-600">
                    <path
                        fill="currentColor"
                        d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"
                    />
                </svg>
            </div>
            <span className="text-2xl font-bold text-blue-600">
                StudyBuddy
            </span>
        </div>
    )

}

export default Logo;