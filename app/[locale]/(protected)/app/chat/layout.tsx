import {
    Card,
    CardContent,
    CardHeader,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import ContactList from "./components/contact-list";
import { getContacts } from './utils';
import MyProfile from './components/my-profile';
import Search from './components/search';
import ChatSidebarWrapper from './sidebar-wrapper';
import ChatWrapper from './chat-wrapper';

const layout = async ({ children }: { children: React.ReactNode }) => {
    const contacts = await getContacts()
    
    return (
        <ChatWrapper>
            {/* التعديل بيبدأ من هنا: أضفنا div بـ flex عشان السايد بار والشات يبقوا جنب بعض */}
            <div className="flex h-full w-full overflow-hidden gap-5"> 
                
                <ChatSidebarWrapper>
                    <Card className="h-full pb-0">
                        <CardHeader className="border-none pb-3">
                            <MyProfile />
                        </CardHeader>
                        <CardContent className="pt-0 px-0 h-full">
                            <ScrollArea className="lg:h-[calc(100%-62px)] h-[calc(100%-80px)]">
                                <div className='sticky top-0 z-10 bg-card'>
                                    <Search />
                                </div>
                                {
                                    contacts?.map((contact) => {
                                        return (
                                            <ContactList
                                                key={contact.id}
                                                contact={contact}
                                            />
                                        )
                                    })
                                }
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </ChatSidebarWrapper>

                {/* هنا الجزء اللي فيه المحادثة (اليمين) */}
                <div className='flex-1 h-full flex flex-col min-w-0'>
                    {children}
                </div>
                
            </div>
        </ChatWrapper>
    )
}

export default layout;