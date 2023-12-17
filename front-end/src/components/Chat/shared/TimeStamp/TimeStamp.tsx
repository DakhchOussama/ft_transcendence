'use client'

import { formatDateAndTime } from '../../../../app/utils/dateUtils';
import style from '../../../../styles/ChatStyles/TimeStamp.module.css'

function TimeStamp({ time }:{time: string }) {

    return (
      <div
        className={`${style.time_stamp} ${style.time_stamp__font_size} ${style.time_stamp__color_gray}`}
      >
        {time && formatDateAndTime(time)}
      </div>
    );
  }

export default TimeStamp;