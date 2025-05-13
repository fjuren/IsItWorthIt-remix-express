import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './Button';
import { filterOptions } from '~/utils/constants';
import { useNavigate } from 'react-router';
import { Filters } from './Filters';

export function SideNav( storeData:any ) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(true);

    function resetInputs(inputType: 'filter' | 'search') {
      const params = new URLSearchParams(location.search);
      if (inputType === 'search') {
        params.delete('gameTitle')
      } else if (inputType === 'filter') {
        for (const k in filterOptions) {
          params.delete(k)
        }
      }
      navigate(`?${params.toString()}`)
    }

  return (
    <>
      {/* Desktop side navigation */}
      <div className={`hidden pb-20 md:flex flex-col h-full border-r border-black ${open ? 'h-screen overflow-y-auto p-3 w-80' : 'w-20'} relative`}>
        <button className="absolute right-0" onClick={() => setOpen(!open)}>
          <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`${
              open ? '' : 'rotate-180'
            } bg-slate-400 size-5 rounded-md`}
          >
            <path
              d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0433 8.13508 11.8419L4.38508 7.84188C4.20477 7.64955 4.20477 7.35027 4.38508 7.15794L8.13508 3.15794C8.32394 2.95648 8.64036 2.94628 8.84182 3.13514Z"
              fill="currentColor"
              fillRule="evenodd"
              clipRule="evenodd"
            ></path>
          </svg>
        </button>
        <nav>
          <ul className="flex-col ">
            {open ? (
              <>
                {/* <li>
                  <Link to="/">Games</Link>
                </li>
                <li>
                  <Link to="/">Placeholder</Link>
                </li>
                <li>
                  <Link to="/">Placeholder</Link>
                </li>{' '} */}
                <Filters stores={storeData.data}/>
                <Button className='self-end' variant={"link"} onClick={() => {resetInputs('filter')}}>Clear filters</Button>
              </>
            ) : (
              <>
                <li>
                  <Link to="/">G</Link>
                </li>
                <li>
                  <Link to="/">P</Link>
                </li>
                <li>
                  <Link to="/">P</Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
      {/* Mobile side nav is contained in TopNav component as full screen menu */}
    </>
  );
}
