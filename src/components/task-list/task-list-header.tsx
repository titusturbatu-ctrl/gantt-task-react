import React from "react";
import styles from "./task-list-header.module.css";

export const TaskListHeaderDefault: React.FC<{
  headerHeight: number;
  rowWidth: string;
  fontFamily: string;
  fontSize: string;
  showStatusColumn?: boolean;
  showProgressColumn?: boolean;
}> = ({
  headerHeight,
  fontFamily,
  fontSize,
  rowWidth,
  showStatusColumn = true,
  // For backward compatibility we treat missing prop as "show"
  // and will be driven by TaskList's computed value when provided.
  showProgressColumn = true,
}) => {
  return (
    <div
      className={styles.ganttTable}
      style={{
        fontFamily: fontFamily,
        fontSize: fontSize,
      }}
    >
      <div
        className={styles.ganttTable_Header}
        style={{
          height: headerHeight - 2,
        }}
      >
        <div
          className={styles.ganttTable_HeaderItem}
          style={{
            minWidth: rowWidth,
          }}
        >
          &nbsp;Name
        </div>
        <div
          className={styles.ganttTable_HeaderSeparator}
          style={{
            height: headerHeight * 0.5,
            marginTop: headerHeight * 0.2,
          }}
        />
        <div
          className={styles.ganttTable_HeaderItem}
          style={{
            minWidth: "120px",
            maxWidth: "120px",
          }}
        >
          &nbsp;From
        </div>
        <div
          className={styles.ganttTable_HeaderSeparator}
          style={{
            height: headerHeight * 0.5,
            marginTop: headerHeight * 0.25,
          }}
        />
        <div
          className={styles.ganttTable_HeaderItem}
          style={{
            minWidth: "120px",
            maxWidth: "120px",
          }}
        >
          &nbsp;To
        </div>
        <div
          className={styles.ganttTable_HeaderSeparator}
          style={{
            height: headerHeight * 0.5,
            marginTop: headerHeight * 0.25,
          }}
        />
        {showStatusColumn && (
          <React.Fragment>
            <div
              className={styles.ganttTable_HeaderItem}
              style={{
                minWidth: "140px",
                maxWidth: "140px",
              }}
            >
              &nbsp;Status
            </div>
            <div
              className={styles.ganttTable_HeaderSeparator}
              style={{
                height: headerHeight * 0.5,
                marginTop: headerHeight * 0.25,
              }}
            />
          </React.Fragment>
        )}
        {showProgressColumn && (
          <div
            className={styles.ganttTable_HeaderItem}
            style={{
              minWidth: "80px",
              maxWidth: "80px",
            }}
          >
            &nbsp;Progress
          </div>
        )}
      </div>
    </div>
  );
};
