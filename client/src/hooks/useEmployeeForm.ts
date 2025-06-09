import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEmployeeById, createEmployee, updateEmployee } from '../services/employeeService';
import { getAllDepartments } from '../services/departmentService';
import { Department, PaginatedResponse } from '../@types/department.interface';

interface UseEmployeeFormProps {
  id?: string;
}

interface EmployeeFormValues {
  name: string;
  email: string;
  phone: string;
  dob: string;
  department_id: string;
  salary: string;
  status: 'active' | 'inactive';
  photo: File | undefined;
  currentPhoto?: string;
}

const validationSchema = Yup.object({
  name: Yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  phone: Yup.string()
    .required('Phone number is required')
    .matches(/^\+?[1-9]\d{1,14}$/, 'Phone number must start with + followed by 1-15 digits'),
  dob: Yup.date()
    .required('Date of birth is required')
    .max(new Date(), 'Date of birth cannot be in the future'),
  department_id: Yup.string().required('Department is required'),
  salary: Yup.number()
    .required('Salary is required')
    .min(0, 'Salary must be greater than or equal to 0'),
  status: Yup.string()
    .required('Status is required')
    .oneOf(['active', 'inactive'], 'Invalid status'),
});

export const useEmployeeForm = ({ id }: UseEmployeeFormProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  const { data: employee, isLoading: isLoadingEmployee } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => getEmployeeById(id!),
    enabled: isEditing,
  });

  const { data: departmentsResponse, isLoading: isLoadingDepartments } = useQuery<
    PaginatedResponse<Department>
  >({
    queryKey: ['departments'],
    queryFn: () => getAllDepartments({ page: 1, limit: 100 }),
  });

  const departments = departmentsResponse?.data || [];

  const createMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return createEmployee(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      navigate('/employees');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, formData }: { id: number; formData: FormData }) => {
      return updateEmployee({ id, formData });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', id] });
      navigate('/employees');
    },
  });

  const formik = useFormik<EmployeeFormValues>({
    initialValues: {
      name: employee?.name || '',
      email: employee?.email || '',
      phone: employee?.phone || '',
      dob: employee?.dob?.split('T')[0] || '',
      department_id: employee?.department_id?.toString() || '',
      salary: employee?.salary?.toString() || '',
      status: employee?.status || 'active',
      photo: undefined,
      currentPhoto: employee?.photo,
    },
    validationSchema: isEditing ? validationSchema.omit(['email']) : validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const formData = new FormData();

        Object.entries(values).forEach(([key, value]) => {
          if (isEditing && key === 'email') {
            return;
          }

          if (key === 'photo') {
            if (value instanceof File) {
              formData.append('photo', value);
            }
          } else if (key !== 'currentPhoto' && value !== undefined) {
            formData.append(key, value.toString());
          }
        });

        if (isEditing && id) {
          await updateMutation.mutateAsync({ id: Number(id), formData });
        } else {
          await createMutation.mutateAsync(formData);
        }
      } catch (error: any) {
        formik.setStatus(
          error.response?.data?.message ||
            error.message ||
            'Failed to save employee. Please try again.',
        );
      }
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (file) {
      formik.setFieldValue('photo', file);
    }
  };

  return {
    formik,
    isEditing,
    isLoading: isLoadingEmployee || isLoadingDepartments,
    error: formik.status,
    departments,
    handleFileChange,
    isSubmitting: createMutation.isPending || updateMutation.isPending,
  };
};
