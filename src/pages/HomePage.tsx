
const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-indigo-900 to-purple-950 text-white p-6">
      <h1 className="text-6xl font-extrabold mb-6 tracking-tight">Manga Reader</h1>
      <p className="text-2xl mb-10 opacity-90">Just for the squad • Powered by MangaDex</p>
      <div className="flex gap-6">
        <button className="bg-indigo-600 hover:bg-indigo-500 px-8 py-4 rounded-xl text-lg font-semibold transition shadow-lg">
          Find Manga
        </button>
        <button className="bg-purple-600 hover:bg-purple-500 px-8 py-4 rounded-xl text-lg font-semibold transition shadow-lg">
          Surprise Me
        </button>
      </div>
    </div>
  )
}

export default HomePage