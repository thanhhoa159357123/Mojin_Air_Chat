interface OptionMemberProps {
  setIsOpenMember: () => void;
}

const OptionMember = ({ setIsOpenMember }: OptionMemberProps) => {
  return (
    <div
      className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-matcha/5 dark:hover:bg-matcha/10 group"
      onClick={setIsOpenMember}
    >
      <span className="text-sm font-medium text-foreground group-hover:text-forest dark:group-hover:text-matcha-light">
        Quản lý thành viên
      </span>
    </div>
  );
};

export default OptionMember;