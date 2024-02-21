export function SideNav() {
  return (
    <aside className="flex flex-col w-72 h-full bg-gray-300">
      <div className="">
        {/* Desktop side navigation */}
        <nav>
          <li>profile?</li>
          <ul className="bg-gray-400 h-full w-72 flex-col ">
            <li>Highest rated games</li>
            <li>Most comments</li>
          </ul>
        </nav>
      </div>
    </aside>
  );
}
