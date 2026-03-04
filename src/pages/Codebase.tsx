import { yupResolver } from '@hookform/resolvers/yup';
import {
  CheckboxProps,
  DatePickerProps,
  Form,
  PaginationProps,
  TimePickerProps,
} from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import { Dayjs } from 'dayjs';
import {
  Bell,
  FolderOpen,
  LayoutDashboard,
  Search,
  Settings,
  Trash2,
} from 'lucide-react';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { useDebounceCallback } from 'usehooks-ts';

import { healthCheck } from '@/apis/shared.api';
import styles from '@/assets/styles/components/shared/codebase.module.scss';
import { BaseAutocomplete } from '@/components/shared/BaseAutocomplete';
import { BaseButton } from '@/components/shared/BaseButton';
import { BaseCheckbox } from '@/components/shared/BaseCheckbox';
import { BaseCheckboxGroup } from '@/components/shared/BaseCheckboxGroup';
import { BaseDatePicker } from '@/components/shared/BaseDatePicker';
import { BaseFormItem } from '@/components/shared/BaseFormItem';
import { BaseInput } from '@/components/shared/BaseInput';
import { BaseInputNumber } from '@/components/shared/BaseInputNumber';
import { BaseModal } from '@/components/shared/BaseModal';
import { BasePagination } from '@/components/shared/BasePagination';
import { BaseSelect } from '@/components/shared/BaseSelect';
import { BaseSwitch } from '@/components/shared/BaseSwitch';
import { BaseTable } from '@/components/shared/BaseTable';
import { BaseTimePicker } from '@/components/shared/BaseTimePicker';
import { SELECTORS } from '@/constants/shared.const';
import { usePagination } from '@/hooks/shared/use-pagination';
import {
  baseCheckboxOptions,
  baseSelectOptions,
  suggestions,
  tableColumns,
  tableData,
} from '@/mocks/codebase.mock';
import { EToast } from '@/models/enums/shared.enum';
import { codebaseSchema } from '@/schemas/shared.schema';
import { useLoadingStore } from '@/stores/loading.store';
import { showToast, sleep } from '@/utils/shared.util';

interface IForm {
  email: string;
  fullName: string;
  password: string;
  passwordConfirm: string;
  terms: boolean;
  type: string;
}

export const Codebase: React.FC = () => {
  const codebaseForm = useForm<IForm>({
    defaultValues: {
      email: '',
      fullName: '',
      password: '',
      passwordConfirm: '',
      terms: false,
      type: '',
    },
    mode: 'onChange',
    resolver: yupResolver<IForm>(codebaseSchema),
  });
  const { t } = useTranslation();
  const hideLoading = useLoadingStore((state) => state.hideLoading);
  const showLoading = useLoadingStore((state) => state.showLoading);
  const { pagination, setPagination } = usePagination();

  const [baseCheckbox, setBaseCheckbox] = useState<boolean>(false);
  const [baseCheckboxAll, setBaseCheckboxAll] = useState<boolean>(false);
  const [isIndeterminate, setIsIndeterminate] = useState<boolean>(false);
  const [baseCheckboxGroup, setBaseCheckboxGroup] = useState<unknown[]>([]);
  const [baseSwitch, setBaseSwitch] = useState<boolean>(true);
  const [baseAutocomplete, setBaseAutocomplete] = useState<string>('');
  const [options, setOptions] = useState<DefaultOptionType[]>([]);
  const [baseInput, setBaseInput] = useState<number | string>();
  const [baseInputNumber, setBaseInputNumber] = useState<number | string>();
  const [baseDatePicker, setBaseDatePicker] = useState<Dayjs | null>();
  const [baseTimePicker, setBaseTimePicker] = useState<Dayjs | null>(null);
  const [baseModal, setBaseModal] = useState<boolean>(false);
  const [searchInput, setSearchInput] = useState<string>('');

  const handleGetHealthCheck = useDebounceCallback(async () => {
    await healthCheck();
  }, 200);

  const handleClickIconSvg = useDebounceCallback(() => {
    showToast('handleClickIconSvg');
  }, 200);

  const handleClickButton = useDebounceCallback(() => {
    showToast('handleClickButton');
  }, 200);

  const handleChangeSelect = (value: string) => {
    showToast(`handleChangeSelect: ${value}`);
  };

  const handleChangeCheckbox: CheckboxProps['onChange'] = (event) => {
    setBaseCheckbox(event.target.checked);
    showToast(`handleChangeCheckbox: ${event.target.checked}`);
  };

  const handleCheckAllChange: CheckboxProps['onChange'] = (event) => {
    setBaseCheckboxAll(event.target.checked);
    setIsIndeterminate(false);
    setBaseCheckboxGroup(
      event.target.checked
        ? baseCheckboxOptions.map((option) => option.value)
        : [],
    );
  };

  const handleCheckboxGroupChange = (checkedValues: unknown[]) => {
    setBaseCheckboxGroup(checkedValues);
    setIsIndeterminate(
      checkedValues.length > 0 &&
        checkedValues.length < baseCheckboxOptions.length,
    );
    setBaseCheckboxAll(checkedValues.length === baseCheckboxOptions.length);
  };

  const handleChangeSwitch = (checked: boolean) => {
    setBaseSwitch(checked);
    showToast(`handleChangeSwitch: ${checked}`);
  };

  const handleSearch = (value: string) => {
    const results = suggestions.filter((suggestion) =>
      suggestion.value.toLowerCase().includes(value.toLowerCase()),
    );
    setBaseAutocomplete(value);
    setOptions(results);
  };

  const handleChangeInput = useDebounceCallback((value: number | string) => {
    showToast(`handleChangeInput: ${value}`);
  }, 200);

  const handleChangeDatePicker: DatePickerProps['onChange'] = (
    date,
    dateString,
  ) => {
    setBaseDatePicker(date);
    showToast(`handleChangeDatePicker: ${dateString}`);
  };

  const handleChangeTimePicker: TimePickerProps['onChange'] = (
    time,
    timeString,
  ) => {
    setBaseTimePicker(time);
    showToast(`handleChangeTimePicker: ${timeString}`);
  };

  const handleModal = () => {
    setBaseModal(false);
    showToast('handleConfirmDialog', EToast.Info);
  };

  const handleChangePagination: PaginationProps['onChange'] = (
    page,
    pageSize,
  ) => {
    setPagination({ currentPage: page, pageSize, total: tableData.length });
  };

  const onSubmit: SubmitHandler<IForm> = async (values) => {
    console.info('onSubmit:', values);
    showToast('onSubmit: check console');
  };

  const handleLoadingFullscreen = async () => {
    showLoading();
    await sleep(3);
    hideLoading();
  };

  useEffect(() => {
    setPagination((state) => ({ ...state, total: tableData.length }));
  }, []);

  return (
    <div className={styles['container']}>
      <section>
        <h4>-- i18n --</h4>
        <div className="tw-flex tw-items-center tw-gap-4">
          <p>{t('shared.hello')}</p>
        </div>
      </section>

      <section id={SELECTORS.APIS_SECTION}>
        <h4>-- APIs --</h4>
        <BaseButton onClick={handleGetHealthCheck}>Health Check</BaseButton>
      </section>

      <section>
        <h4>-- The Loading --</h4>
        <BaseButton onClick={handleLoadingFullscreen}>Fullscreen</BaseButton>
      </section>

      <section>
        <h4>-- Lucide Icons --</h4>
        <div className="tw-flex tw-gap-2">
          {[
            { Icon: Search, name: 'Search' },
            { Icon: Settings, name: 'Settings' },
            { Icon: LayoutDashboard, name: 'LayoutDashboard' },
            { Icon: FolderOpen, name: 'FolderOpen' },
            { Icon: Trash2, name: 'Trash2' },
            { Icon: Bell, name: 'Bell' },
          ].map(({ Icon, name }) => (
            <span
              key={name}
              onClick={handleClickIconSvg}
              title={name}
            >
              <Icon size={20} />
            </span>
          ))}
        </div>
      </section>

      <section>
        <h4>-- Base Buttons --</h4>
        <div className="tw-flex tw-gap-2 tw-mb-4">
          <BaseButton onClick={handleClickButton}>Primary</BaseButton>
          <BaseButton color="blue" onClick={handleClickButton} variant="solid">
            Blue
          </BaseButton>
          <BaseButton color="green" onClick={handleClickButton} variant="solid">
            Green
          </BaseButton>
          <BaseButton
            color="orange"
            onClick={handleClickButton}
            variant="solid"
          >
            Orange
          </BaseButton>
          <BaseButton
            color="danger"
            onClick={handleClickButton}
            variant="solid"
          >
            Danger
          </BaseButton>
          <BaseButton
            color="default"
            onClick={handleClickButton}
            variant="solid"
          >
            Default
          </BaseButton>
        </div>

        <div className="tw-flex tw-gap-2 tw-mb-4">
          <BaseButton
            color="primary"
            onClick={handleClickButton}
            variant="outlined"
          >
            Primary
          </BaseButton>
          <BaseButton
            color="blue"
            onClick={handleClickButton}
            variant="outlined"
          >
            Blue
          </BaseButton>
          <BaseButton
            color="green"
            onClick={handleClickButton}
            variant="outlined"
          >
            Green
          </BaseButton>
          <BaseButton
            color="orange"
            onClick={handleClickButton}
            variant="outlined"
          >
            Orange
          </BaseButton>
          <BaseButton
            color="danger"
            onClick={handleClickButton}
            variant="outlined"
          >
            Danger
          </BaseButton>
          <BaseButton
            color="default"
            onClick={handleClickButton}
            variant="outlined"
          >
            Default
          </BaseButton>
        </div>

        <div className="tw-flex tw-gap-2 tw-mb-4">
          <BaseButton
            icon={<Search size={14} />}
            onClick={handleClickButton}
            shape="circle"
          />
          <BaseButton
            color="blue"
            icon={<Settings size={14} />}
            onClick={handleClickButton}
            shape="circle"
            variant="solid"
          />
          <BaseButton
            color="green"
            icon={<LayoutDashboard size={14} />}
            onClick={handleClickButton}
            shape="circle"
            variant="solid"
          />
          <BaseButton
            color="orange"
            icon={<FolderOpen size={14} />}
            onClick={handleClickButton}
            shape="circle"
            variant="solid"
          />
          <BaseButton
            color="danger"
            icon={<Trash2 size={14} />}
            onClick={handleClickButton}
            shape="circle"
            variant="solid"
          />
          <BaseButton
            color="default"
            icon={<Bell size={14} />}
            onClick={handleClickButton}
            shape="circle"
            variant="outlined"
          />
        </div>
      </section>

      <section>
        <h4>-- Base Selects --</h4>
        <BaseSelect
          onChange={handleChangeSelect}
          options={baseSelectOptions}
          placeholder="Please select"
          style={{ width: 150 }}
        />

        <BaseSelect
          mode="multiple"
          onChange={handleChangeSelect}
          options={baseSelectOptions}
          placeholder="Please multiple select"
          style={{ marginLeft: 16, width: 200 }}
        />
      </section>

      <section>
        <h4>-- Base Checkboxes --</h4>
        <div>
          <BaseCheckbox checked={baseCheckbox} onChange={handleChangeCheckbox}>
            checkbox label
          </BaseCheckbox>
        </div>

        <div>
          <BaseCheckbox
            checked={baseCheckboxAll}
            className="tw-mt-4 tw-mb-1"
            indeterminate={isIndeterminate}
            onChange={handleCheckAllChange}
          >
            Check all
          </BaseCheckbox>
        </div>
        <BaseCheckboxGroup
          onChange={handleCheckboxGroupChange}
          options={baseCheckboxOptions}
          value={baseCheckboxGroup}
        />
      </section>

      <section>
        <h4>-- Base Switches --</h4>
        <div className="tw-flex tw-items-center">
          <BaseSwitch checked={baseSwitch} onChange={handleChangeSwitch} />
          <span className="tw-ml-2">switch label</span>
        </div>
      </section>

      <section>
        <h4>-- Base Autocompletes --</h4>
        <BaseAutocomplete
          onChange={setBaseAutocomplete}
          onSearch={handleSearch}
          options={options}
          placeholder="Please input"
          style={{ width: 200 }}
          value={baseAutocomplete}
        />
      </section>

      <section>
        <h4>-- Base Inputs --</h4>
        <div className="tw-flex tw-gap-2">
          <BaseInput
            className="!tw-w-[200px]"
            onChange={(event) => {
              setBaseInput(event.target.value);
              handleChangeInput(event.target.value);
            }}
            placeholder="Please input"
            value={baseInput}
          />

          <BaseInputNumber
            className="!tw-w-[200px]"
            onChange={(value) => {
              setBaseInputNumber(value as number | string);
              handleChangeInput(value as number | string);
            }}
            placeholder="Please input number"
            value={baseInputNumber}
          />

          <BaseInput
            allowClear
            className="!tw-w-[300px]"
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder={`${t('shared.search')}...`}
            type="search"
            value={searchInput}
          />
        </div>
      </section>

      <section>
        <h4>-- Base DatePickers --</h4>
        <BaseDatePicker
          onChange={handleChangeDatePicker}
          placeholder="Pick a day"
          value={baseDatePicker}
        />
      </section>

      <section>
        <h4>-- Base TimePickers --</h4>
        <BaseTimePicker
          onChange={handleChangeTimePicker}
          placeholder="Pick a time"
          value={baseTimePicker}
        />
      </section>

      <section>
        <h4>-- Base Modals --</h4>
        <BaseButton onClick={() => setBaseModal(true)}>Open Modal</BaseButton>
        <BaseModal
          footer={[
            <BaseButton key="ok" onClick={handleModal}>
              OK
            </BaseButton>,
          ]}
          onCancel={() => setBaseModal(false)}
          open={baseModal}
          title="Modal Title"
          width={500}
        >
          <span>This is a modal content</span>
        </BaseModal>
      </section>

      <section>
        <h4>-- Base Tables --</h4>
        <BaseTable
          columns={tableColumns}
          dataSource={tableData}
          rowKey="id"
          scroll={{ y: 300 }}
        />

        <BasePagination
          className="tw-mt-4 tw-flex-center"
          current={pagination.currentPage}
          onChange={handleChangePagination}
          pageSize={pagination.pageSize}
          showSizeChanger
          total={pagination.total}
        />
      </section>

      <section>
        <h4>-- Base Forms --</h4>
        <FormProvider {...codebaseForm}>
          <Form
            layout="vertical"
            onFinish={codebaseForm.handleSubmit(onSubmit)}
            style={{ maxWidth: '600px' }}
          >
            <div className="tw-grid tw-grid-cols-2 tw-gap-4">
              <BaseFormItem label="Full Name" name="fullName" required>
                <BaseInput placeholder="Enter your full name" />
              </BaseFormItem>

              <BaseFormItem label="Type" name="type" required>
                <BaseSelect
                  options={baseSelectOptions}
                  placeholder="Choose a type"
                />
              </BaseFormItem>
            </div>

            <div className="tw-grid tw-grid-cols-3 tw-gap-4">
              <BaseFormItem label="Email" name="email" required>
                <BaseInput placeholder="Enter your email address" />
              </BaseFormItem>

              <BaseFormItem label="Password" name="password" required>
                <BaseInput placeholder="Create a password" type="password" />
              </BaseFormItem>

              <BaseFormItem
                label="Confirm Password"
                name="passwordConfirm"
                required
              >
                <BaseInput
                  placeholder="Re-enter your password"
                  type="password"
                />
              </BaseFormItem>
            </div>

            <BaseFormItem name="terms" required valuePropName="checked">
              <BaseCheckbox>Agree to terms and conditions</BaseCheckbox>
            </BaseFormItem>

            <div className="tw-flex tw-gap-2">
              <BaseButton htmlType="submit">Submit</BaseButton>
              <BaseButton
                color="default"
                onClick={() => codebaseForm.reset()}
                type="default"
              >
                Reset
              </BaseButton>
            </div>
          </Form>
        </FormProvider>
      </section>
    </div>
  );
};
