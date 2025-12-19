import { RequirementType } from '@/types';

interface BadgeProps {
  type: RequirementType;
}

export default function Badge({ type }: BadgeProps) {
  let styles = "";

  switch (type) {
    case RequirementType.Functional:
      styles = "bg-[#D1FAE5] text-[#065F46] dark:bg-[#065F46]/30 dark:text-[#D1FAE5]";
      break;
    case RequirementType.NonFunctional:
      styles = "bg-[#FEE2E2] text-[#991B1B] dark:bg-[#991B1B]/30 dark:text-[#FEE2E2]";
      break;
    case RequirementType.Conjectural:
      styles = "bg-[#EDE9FE] text-[#5B21B6] dark:bg-[#5B21B6]/30 dark:text-[#EDE9FE]";
      break;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles}`}>
      {type}
    </span>
  );
}
