import React from "react";
import {
  Search,
  MapPin,
  Heart,
  Home,
  Ticket,
  User,
  ChevronDown,
} from "lucide-react";

const ExplorePage = () => {
  return (
    <div className="min-h-screen bg-white px-4 pt-6 pb-20">
      {/* Header */}
      <header className="mb-6">
        <div className="text-sm text-gray-500 mb-1">Explore</div>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Tashkent</h1>
          <button className="flex items-center text-sm text-gray-600 space-x-1">
            <MapPin className="w-4 h-4 text-[#FF7352]" />
            <span>Aspen, USA</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Find things to do"
          className="w-full bg-gray-50 rounded-2xl py-3 pl-12 pr-4 text-gray-600 focus:outline-none"
        />
      </div>

      {/* Categories */}
      <div className="flex space-x-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        <button className="bg-[#FF7352]/10 text-[#FF7352] px-4 py-2 rounded-full whitespace-nowrap font-medium">
          Location
        </button>
        <button className="text-gray-500 px-4 py-2 rounded-full whitespace-nowrap">
          Hotels
        </button>
        <button className="text-gray-500 px-4 py-2 rounded-full whitespace-nowrap">
          Food
        </button>
        <button className="text-gray-500 px-4 py-2 rounded-full whitespace-nowrap">
          Adventure
        </button>
        <button className="text-gray-500 px-4 py-2 rounded-full whitespace-nowrap">
          Art
        </button>
      </div>

      {/* Popular Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Popular</h2>
          <button className="text-[#FF7352] text-sm">See all</button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="relative rounded-2xl overflow-hidden">
            <img
              src="./club.jpg"
              alt="Alley Palace"
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </button>
            <div className="absolute bottom-3 left-3 text-white">
              <div className="font-medium mb-1">Alley Palace</div>
              <div className="flex items-center space-x-1">
                <span className="text-yellow-400">★</span>
                <span className="text-sm">4.1</span>
              </div>
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden">
            <img
              src="./club.jpg"
              alt="Coeurdes Alpes"
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </button>
            <div className="absolute bottom-3 left-3 text-white">
              <div className="font-medium mb-1">Coeurdes Alpes</div>
              <div className="flex items-center space-x-1">
                <span className="text-yellow-400">★</span>
                <span className="text-sm">4.5</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Section */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Recommended</h2>
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden">
            <img
              src="./club.jpg"
              alt="Explore Aspen"
              className="w-full h-32 object-cover"
            />
            <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-white text-sm px-2 py-1 rounded">
              4N/5D
            </div>
            <div className="absolute bottom-3 left-3">
              <div className="text-white font-medium">Explore Aspen</div>
              <div className="flex items-center space-x-1 mt-1">
                <div className="bg-[#FF7352] text-white text-xs px-2 py-0.5 rounded">
                  Hot Deal
                </div>
              </div>
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden">
            <img
              src="./club.jpg"
              alt="Luxurious Aspen"
              className="w-full h-32 object-cover"
            />
            <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-white text-sm px-2 py-1 rounded">
              2N/3D
            </div>
            <div className="absolute bottom-3 left-3">
              <div className="text-white font-medium">Luxurious Aspen</div>
              <div className="flex items-center space-x-1 mt-1">
                <div className="bg-[#FF7352] text-white text-xs px-2 py-0.5 rounded">
                  Hot Deal
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t py-3 px-8">
        <div className="flex justify-between items-center">
          <button className="flex flex-col items-center text-[#FF7352]">
            <Home className="w-6 h-6" />
            <span className="text-xs mt-1">Home</span>
          </button>
          <button className="flex flex-col items-center text-gray-400">
            <Ticket className="w-6 h-6" />
            <span className="text-xs mt-1">Tickets</span>
          </button>
          <button className="flex flex-col items-center text-gray-400">
            <Heart className="w-6 h-6" />
            <span className="text-xs mt-1">Saved</span>
          </button>
          <button className="flex flex-col items-center text-gray-400">
            <User className="w-6 h-6" />
            <span className="text-xs mt-1">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;
