const MainLayout = ({ children, title }) => {
    return (
        <main className='p-4 w-full h-full flex flex-col items-center justify-center gap-4'>
            <h1 className="text-2xl font-semibold text-center text-blue-800">{title}</h1>
            <div className="w-full h-full flex flex-col md:flex-row items-center justify-center gap-4">
             {children}
            </div>
        </main>
    )
}

export default MainLayout