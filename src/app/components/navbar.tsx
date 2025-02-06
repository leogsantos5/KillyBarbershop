import Link from 'next/link';

function Navbar() {
  const navigation = [
    { name: 'Início', href: '/' },
    { name: 'Serviços', href: '/services' },
    { name: 'Marcar', href: '/booking' },
  ];

  return (
    <nav className="bg-white shadow-lg border-b-4 border-red-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link href="/" className="text-3xl font-extrabold text-gray-900 hover:text-blue-700 transition-colors">
              KR<span className="text-red-600">&</span>XG
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="flex items-baseline space-x-6">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href}
                  className="text-xl font-large text-gray-900 hover:text-blue-600 px-4 rounded-md transition-colors">
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
