import { GeneralInfoCard } from './components/general-info-card';
import { EducationCard } from './components/education-card';
import { WorkExperienceCard } from './components/work-experience-card';

export function ProfileOverviewContent() {
  return (
    <div className="flex flex-col gap-5 lg:gap-7.5">
      <div className="flex flex-col gap-5 lg:gap-7.5">
        <GeneralInfoCard />
        <WorkExperienceCard />
        <EducationCard />
      </div>
    </div>
  );
}


