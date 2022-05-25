function getInterceptPt (A, B, C, D) {
    /*
    for line AB and line CD, the interception point could be calc. by
    intercept.x = A.x + t * (B.x - A.x) = C.x + u * (D.x - C.x)
    intercept.y = A.y + t * (B.y - A.y) = C.y + u * (D.y - C.y)
    */
    const tNumerator = (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x);
    const uNumerator = (C.y - A.y) * (A.x - B.x) - (A.y - B.y) * (C.x - A.x);
    const denominator = (D.y - C.y) * (B.x - A.x) - (B.y - A.y) * (D.x - C.x);

    if (denominator != 0) {
        const t = tNumerator / denominator;
        const u = uNumerator / denominator;
        if (t >= 0 && t <= 1 && u >= 0 && u <=1) {
            return {
                x: A.x + (B.x - A.x) * t,
                y: A.y + (B.y - A.y) * t,
                offset: t
            }
        }
    }
    return null;
}