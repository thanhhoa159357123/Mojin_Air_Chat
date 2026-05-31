interface OptionMemberProps {
  setIsOpenMember: () => void;
}

const OptionMember = ({ setIsOpenMember }: OptionMemberProps) => {
  return (
    <div className="rounded-xl overflow-hidden">
      <div
        className="flex items-center justify-between px-3 py-3 cursor-pointer transition-all duration-200 hover:bg-accent group"
        onClick={setIsOpenMember}
      >
        <span className="font-medium text-foreground group-hover:text-primary">
          Quản lý thành viên
        </span>
      </div>
    </div>
  );
};

export default OptionMember;
