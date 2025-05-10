
import { Button } from './Button';
import { Label } from './Label';
import { Checkbox } from './Checkbox';
import { Form, useSearchParams } from 'react-router-dom';
import { useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { Stores } from '~/types/store';
import { useState } from 'react';
import { GameFilterSchema } from '~/utils/fieldValidation'
import { 
      Dialog,
      DialogTrigger,
      DialogContent,
      DialogHeader,
      DialogFooter,
      DialogTitle,
      DialogDescription,
      DialogClose

 }
 from './Dialog'
import { Slider } from './Slider';
import { InputWithIcon } from './InputWithIcon';
import { Clock9Icon, DollarSignIcon, PercentIcon} from 'lucide-react';
import { filterOptions } from '~/utils/constants';
import { handleSearchParams } from '~/utils/misc';

interface FilterStoreDialogProps {
  stores: Stores;
}

export function DialogCheckboxFilters({ stores }: FilterStoreDialogProps) {
  const [searchParams] = useSearchParams();

  // Get initial params from URL
  const initMinPrice = searchParams.get(filterOptions.lowerPrice) ?? "0";
  const initMaxPrice = searchParams.get(filterOptions.upperPrice) ?? "300";
  const initRecentSales = searchParams.get(filterOptions.maxAge) ?? "2500";
  const initSteamRatings = searchParams.get(filterOptions.steamRating) ?? "0";
  const initMetacritic = searchParams.get(filterOptions.metacritic) ?? "0";
  const initOnlyGameSales = searchParams.get(filterOptions.onlyGameSales);
  // const iniSteamWorks = searchParams.get(filterOptions.steamworks);
  const initstoreID = searchParams.getAll(filterOptions.storeID);
  const initAAA = searchParams.get(filterOptions.AAA);

  // Tracks local state/checkbox selection. Required in order to see ShadCN checkbox component UI updates on clicked
const [priceRange, setPriceRange] = useState<[string, string]>([initMinPrice, initMaxPrice]);
const [minPriceFromRange, maxPriceFromRange] = priceRange;

const [recentSales, setRecentSales] = useState<string>(initRecentSales);
const [steamRatings, setSteamRatings] = useState<string>(initSteamRatings);
const [metacriticRatings, setMetacriticRatings] = useState<string>(initMetacritic);

const [gameSales, setGameSales] = useState<string | null>(initOnlyGameSales);
// const [steamWorks, setSteamWorks] = useState<string | null>(iniSteamWorks);
const [storeIDs, setStoreIDs] = useState<string[]>(initstoreID);
const [AAA, setAAA] = useState<string | null>(initAAA);


  const [form, fields] = useForm({
    id: 'store-filter',
    defaultValue: {
      storeID: initstoreID,
    },
    constraint: getZodConstraint(GameFilterSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: GameFilterSchema });
    },
  });

  // Filter only active stores since API includes stores marked as inactive
  const activeStores = stores.filter((store) => store.isActive === 1);

  // Toggle store selection; This is to handle checkmark state and tell shadcn that its checkbox was clicked. Otherwise the checkbox UI won't change; the input field is only 'clicked' .
  const toggleStore = (storeID: string) => {
    setStoreIDs((prev) =>
      prev.includes(storeID)
        ? prev.filter((id) => id !== storeID)
        : [...prev, storeID]
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {/* handling count visible on filter button UI; ignoring count if gameTitle part of params */}
        <Button variant="outline">Filter {searchParams.size === 0 ? '': searchParams.get('gameTitle') ? (searchParams.size - 1 === 0 ? '' : `(${searchParams.size - 1})`) : `(${searchParams.size})`}
        </Button>
      </DialogTrigger>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filter</DialogTitle>
          <DialogDescription>
            Modify your search results. Click save when you&apos;re done
          </DialogDescription>
        </DialogHeader>
        <Form method="get" id={form.id} onSubmit={form.onSubmit}>
        {/* Price */}
        {/* lowerPrice */}
        {/* upperPrice */}
        <fieldset>
            <legend>Price range (Sale only?)</legend>
            <div className="space-y-2 mt-2">
                <div className="flex items-center space-x-2">
                    <InputWithIcon startIcon={DollarSignIcon} type='number' placeholder='Min' name='lowerPrice' value={minPriceFromRange} onInput={(e: React.ChangeEvent<HTMLInputElement>) => {setPriceRange([e.target.value, maxPriceFromRange])}}></InputWithIcon>
                    <span className="h-px w-6 bg-gray-400" />
                    <InputWithIcon startIcon={DollarSignIcon} type='number' placeholder='Max' name='upperPrice' value={maxPriceFromRange} onInput={(e: React.ChangeEvent<HTMLInputElement>) => {setPriceRange([minPriceFromRange, e.target.value])}}></InputWithIcon>
                </div>
                <div>
                    <Slider id="recentSales" value={[parseInt(minPriceFromRange), parseInt(maxPriceFromRange)]} onValueChange={([min, max]) => setPriceRange([min.toString(), max.toString()])} min={0} max={300} step={1} />
                </div>
            </div>
        </fieldset>

        {/* Sale only games */}
        {/* onSale */}
        <fieldset>
            <legend>Sales</legend>
            <div className="space-y-2 mt-2">
                {/* note: cheap shark booleans are 0 & 1 */}
                {gameSales === "1" && <input type='hidden' name='onSale' value={1} />}
                <div className="flex items-center space-x-2">
                    <Checkbox id='onSale' checked={gameSales === "1"} onCheckedChange={() => setGameSales((prev) => prev === null ? "1" : null)}/>
                    <Label 
                        htmlFor={`onSale`}
                        className="cursor-pointer"
                    >Only show games on sale</Label>
                </div>
            </div>
        </fieldset>

        {/* Time since deal start */}
        {/* maxAge */}
        <fieldset>
            <legend>Recent Sales</legend>
            <div className="space-y-2 mt-2">
                <div className="space-x-2">
                    <div className="space-x-2">
                    <Label htmlFor="maxAge">Show deals posted from the last {" "}
                        {recentSales} {recentSales === "1" ? "hour" : "hours"} /{" "}
                        {(parseInt(recentSales || "0") / 24).toFixed(1)}{" "}
                        {(parseInt(recentSales || "0") / 24).toFixed(1) === "1.0" ? "day" : "days"}
                    </Label>
                    <InputWithIcon startIcon={Clock9Icon} type='number' placeholder='Hours' name='maxAge' value={recentSales} onInput={(e: React.ChangeEvent<HTMLInputElement>) => {setRecentSales(e.target.value)}}></InputWithIcon>
                    </div>
                    <div>
                        <Slider id="maxAge" value={[parseInt(recentSales as string)]} onValueChange={([val]) => setRecentSales(val.toString())} min={0} max={2500} step={1} />
                    </div>
                 </div>
            </div>
        </fieldset>

        {/* Ratings */}
        {/* meatcritic */}
        {/* steamRating */}
        <fieldset>
            <legend>Ratings</legend>
            <div className="space-y-2 mt-2">
                <div className="space-x-2">
                    <div className="space-x-2">
                    <Label htmlFor="steamRating">Minimum Steam User Rating (%)
                    </Label>
                    <span className='text-sm italic'>Only include games where at least this percentage of Steam user reviews are positive.</span>
                    <InputWithIcon startIcon={PercentIcon} type='number' placeholder='Rating' name='steamRating' value={steamRatings} onInput={(e: React.ChangeEvent<HTMLInputElement>) => {setSteamRatings(e.target.value)}}></InputWithIcon>
                    </div>
                    <div>
                        <Slider id="steamRating" value={[parseInt(steamRatings as string)]} onValueChange={([val]) => setSteamRatings(val.toString())} min={0} max={100} step={1} />
                    </div>
                 </div>
            </div>
            <div className="space-y-2 mt-2">
                <div className="space-x-2">
                    <div className="space-x-2">
                    <Label htmlFor="metacritic">Minimum Metacritic User Rating (%)
                    </Label>
                    <span className='text-sm italic'>Only include games where at least this percentage of Steam user reviews are positive.</span>
                    <InputWithIcon startIcon={PercentIcon} type='number' placeholder='Rating' name='metacritic' value={metacriticRatings} onInput={(e: React.ChangeEvent<HTMLInputElement>) => {setMetacriticRatings(e.target.value)}}></InputWithIcon>
                    </div>
                    <div>
                        <Slider id="metacritic" value={[parseInt(metacriticRatings as string)]} onValueChange={([val]) => setMetacriticRatings(val.toString())} min={0} max={100} step={1} />
                    </div>
                 </div>
            </div>
        </fieldset>

        {/* Stores */}
          <fieldset className='space-y-2 mt-2'>
            <legend className="text-md font-medium">Stores</legend>
            
            {/* Only redeemable on Steam */}
            {/* ------------ */}
            {/* NOTE: Leaving steamworks out for now due to reliability of data. From api author: "that particular flag is available on the request, but doesn't show in response. Mostly because it is more a "best guess" and not very reliable" */}
            {/* ------------ */}
            {/* <div className="space-y-2 mt-2">
                {steamWorks === "1" && <input type='hidden' name='steamworks' value={1} />}
                <div className="flex items-center space-x-2">
                    <Checkbox id='steamworks' checked={steamWorks === "1"} onCheckedChange={() => setSteamWorks((prev) => prev === null ? "1" : null)}/>
                    <Label 
                        htmlFor={`steamworks`}
                        className="cursor-pointer"
                    >Only redeemable on Steam (turn into switch?)</Label>
                    <span className='text-sm italic'>Only shows games that include a Steam key</span>
                </div>
            </div> */}

            {/* Store filters */}
            <div className="space-y-2 mt-2">
              {/* Handles hidden inputs for all selected store IDs*/}
              {/* Why? According to docs: Shadcn's Checkbox component doesn't automatically sync its internal state with the native checkbox — and clicking the label triggers the native input (which is visually hidden), not the Shadcn one */}
              {storeIDs.map((storeID) => (
                <input
                  key={storeID}
                  type="hidden"
                  name={fields.storeID.name}
                  value={storeID}
                />
              ))}
              

              {activeStores.map((store) => {
                const isChecked = storeIDs.includes(store.storeID);
                return (
                  <div
                    key={store.storeID}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => toggleStore(store.storeID)}
                      id={`store-checkbox-${store.storeID}`}
                    />
                    <Label
                      htmlFor={`store-checkbox-${store.storeID}`}
                      className="cursor-pointer"
                    >
                      {store.storeName}
                    </Label>
                  </div>
                );
              })}
            </div>
          </fieldset>
          
        {/* Only AAA-like games */}
        {/* AAA */}
        <fieldset>
            <legend>AAA-like</legend>
            <div className="space-y-2 mt-2">
                {/* note: cheap shark booleans are 0 & 1 */}
                {AAA === "1" && <input type='hidden' name='AAA' value={1} />}
                <div className="flex items-center space-x-2">
                    <Checkbox id='AAA' checked={AAA === "1"} onCheckedChange={() => setAAA((prev) => prev === null ? "1" : null)}/>
                    <Label 
                        htmlFor={`AAA`}
                        className="cursor-pointer"
                    >Only show AAA-like games</Label>
                </div>
            </div>
        </fieldset>

          <DialogFooter>
            <DialogClose>
              <Button type="submit" className="mt-4">
                Apply Filters
              </Button>
            {
                handleSearchParams(searchParams, 
                  Object.values(filterOptions)
                )
            }
            </DialogClose>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
