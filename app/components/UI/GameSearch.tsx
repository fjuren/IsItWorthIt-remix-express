import { Form } from 'react-router-dom';
import {useSearchParams} from 'react-router'
import { Button } from './Button';
import { getFormProps, useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { SearchSchema } from '~/utils/fieldValidation';
import { InputWithIcon } from './InputWithIcon';
import { FormOrFieldErrorsList, handleSearchParams } from '~/utils/misc';
import { gameTitle } from '~/utils/constants';
import { Search } from 'lucide-react';


export function GameSearch() {
  const [searchParams] = useSearchParams();
  // const navigate = useNavigate()

  const [form] = useForm({
    id: 'gameTitle',
    defaultValue: {},
    constraint: getZodConstraint(SearchSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: SearchSchema });
    },
  });

  return (
    <>
            <div className='flex flex-col md:flex-row'>
                {/* <Button className='self-end hidden sm:block' variant={"link"} onClick={() => {resetInputs('search', navigate)}}>Reset search</Button> */}
              <Form method="GET" {...getFormProps(form)} className="flex flex-col w-full md:flex-row gap-2 mt-2 md:m-auto">
                <InputWithIcon
                  key={searchParams.get('gameTitle') ?? 'empty'} // forces re-render (remix prevents re-render which would prevent the defaultValue from working when reseting search)
                  startIcon={Search}
                  name="gameTitle"
                  type="search"
                  placeholder="Search game title"
                  defaultValue={searchParams.get('gameTitle') ?? ''}
                  />
                <Button className='hidden sm:block' type="submit" variant={'secondary'}>
                  Search
                </Button>
                <div>
                  <FormOrFieldErrorsList data={form.errors} errorID={form.errorId} />
                </div>
                {
                    handleSearchParams(searchParams, [gameTitle])
                }
              </Form>
            </div>
                </>
            )
}
