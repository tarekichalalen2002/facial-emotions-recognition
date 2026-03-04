import Logo from './Logo'
import { Link } from 'react-router-dom'
const Navbar = () => {
    return (
        <div className="p-4 flex items-center justify-center font-semibold relative w-[100vw]">
            <div className="absolute left-4">
                <Logo height={65} width={65} color="black" hoverColor="blue" />
            </div>
            <div className="flex items-center gap-20 justify-center ">
                <Link to="/cnn" className="hover:text-blue-500">CNN</Link>
                <Link to="/vit" className="hover:text-blue-500">ViT</Link>
            </div>
        </div>
    )
}

export default Navbar