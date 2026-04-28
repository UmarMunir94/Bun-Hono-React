import { GeneralInfoCard } from './components/general-info-card';
import { EducationCard } from './components/education-card';

export function ProfileOverviewContent() {
  return (
    <div className="flex flex-col gap-5 lg:gap-7.5">
      <div className="flex flex-col gap-5 lg:gap-7.5">
        <GeneralInfoCard />
        <EducationCard />
      </div>
    </div>
  );
}

