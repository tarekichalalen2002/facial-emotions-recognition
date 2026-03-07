import Logo from './Logo'
import { Link } from 'react-router-dom'
const Navbar = () => {
    return (
        <div className="p-4 flex items-center justify-center font-semibold relative w-screen">
            <div className="absolute left-4">
                <Link to="/">
                    <Logo height={65} width={65} color="black" hoverColor="blue" />
                </Link>
            </div>
            <div className="flex items-center gap-20 justify-center">
                <Link to="/" className="hover:text-blue-500">Home</Link>
                <Link to="/cnn" className="hover:text-blue-500">CNN</Link>
                <Link to="/vit" className="hover:text-blue-500">ViT</Link>
            </div>
        </div>
    )
}

export default Navbar