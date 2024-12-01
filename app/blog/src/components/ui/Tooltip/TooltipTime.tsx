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
          <div className="flex items-center select-none">
            Posted on {props.postTime}
          </div>
          <div className="flex items-center select-none">
            Updated on {props.updatedTime}
          </div>
        </>
      }
      trigger={props.children}
      useContentContainer
    />
  );
}
