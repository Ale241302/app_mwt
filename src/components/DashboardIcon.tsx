import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

interface DashboardIconProps {
    size?: number;
    color?: string;
    focused?: boolean;
}

const DashboardIcon: React.FC<DashboardIconProps> = ({
    size = 24,
    color = '#000',
    focused = false
}) => {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {focused ? (
                <>
                    {/* Filled version for focused state */}
                    <Rect x="3" y="3" width="7" height="7" rx="1.5" fill={color} />
                    <Rect x="14" y="3" width="7" height="7" rx="1.5" fill={color} />
                    <Rect x="3" y="14" width="7" height="7" rx="1.5" fill={color} />
                    <Rect x="14" y="14" width="7" height="7" rx="1.5" fill={color} />
                </>
            ) : (
                <>
                    {/* Outline version for unfocused state */}
                    <Path
                        d="M4.5 3C3.67157 3 3 3.67157 3 4.5V8.5C3 9.32843 3.67157 10 4.5 10H8.5C9.32843 10 10 9.32843 10 8.5V4.5C10 3.67157 9.32843 3 8.5 3H4.5Z"
                        stroke={color}
                        strokeWidth="2"
                        fill="none"
                    />
                    <Path
                        d="M15.5 3C14.6716 3 14 3.67157 14 4.5V8.5C14 9.32843 14.6716 10 15.5 10H19.5C20.3284 10 21 9.32843 21 8.5V4.5C21 3.67157 20.3284 3 19.5 3H15.5Z"
                        stroke={color}
                        strokeWidth="2"
                        fill="none"
                    />
                    <Path
                        d="M4.5 14C3.67157 14 3 14.6716 3 15.5V19.5C3 20.3284 3.67157 21 4.5 21H8.5C9.32843 21 10 20.3284 10 19.5V15.5C10 14.6716 9.32843 14 8.5 14H4.5Z"
                        stroke={color}
                        strokeWidth="2"
                        fill="none"
                    />
                    <Path
                        d="M15.5 14C14.6716 14 14 14.6716 14 15.5V19.5C14 20.3284 14.6716 21 15.5 21H19.5C20.3284 21 21 20.3284 21 19.5V15.5C21 14.6716 20.3284 14 19.5 14H15.5Z"
                        stroke={color}
                        strokeWidth="2"
                        fill="none"
                    />
                </>
            )}
        </Svg>
    );
};

export default DashboardIcon;
