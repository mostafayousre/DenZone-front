import { Card } from "@/components/ui/card";
import TransactionsTable from "../user-rules/transactions";

const DoctorsPage = () => {
  return (
    <div>
      <Card>
        <TransactionsTable defaultRoleName="Doctor" hideTabs={true} />
      </Card>
    </div>
  );
};

export default DoctorsPage;
