export function fetchJsonBody(obj: any) {
    return {
        body: JSON.stringify(obj),
        headers: { 'Content-Type': 'application/json' },
    }
}