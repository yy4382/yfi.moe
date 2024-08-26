import Tooltip from "./Tooltip";

export default function (props: {
  postTime: string;
  updatedTime: string;
  children: React.ReactNode;
}) {
  return (
    <Tooltip
      content={
        <>
          <div className="flex select-none items-center">
            Posted on {props.postTime}
          </div>
          <div className="flex select-none items-center">
            Updated on {props.updatedTime}
          </div>
        </>
      }
      trigger={props.children}
      useContentContainer
    />
  );
}
