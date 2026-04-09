interface RecentActivityProps {
    data: {
        id: string;
        fullName: string;
        orderDate: string;
    }[];
}

const RecentActivity = ({ data }: RecentActivityProps) => {
    return (
        <ul className="space-y-3 h-full">
            {data.map((item) => (
                <li
                    className="flex items-center gap-3 border-b border-default-100 dark:border-default-300 last:border-b-0 pb-3 last:pb-0"
                    key={item.id}
                >
                    <div className="flex-1 text-start overflow-hidden text-ellipsis whitespace-nowrap max-w-[63%]">
                        <div className="text-sm text-default-600 overflow-hidden text-ellipsis whitespace-nowrap">
                            <span className="font-medium">{item.fullName}</span> placed an order
                        </div>
                    </div>
                    <div className="flex-none">
                        <div className="text-sm font-light text-default-400 dark:text-default-600">
                            {new Date(item.orderDate).toLocaleDateString()}
                        </div>
                    </div>
                </li>
            ))}
        </ul>
    );
};

export default RecentActivity;