import { html } from '../../src/index.ts'

export interface StableItem {
    id: number
    name: string
}

export function generateItems(count: number): StableItem[] {
    return Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        name: `item-${i + 1}`,
    }))
}

export function copyItems(items: StableItem[]): StableItem[] {
    return items.map((item) => ({ ...item }))
}

export function generatePrimitives(count: number): number[] {
    return Array.from({ length: count }, (_, i) => i + 1)
}

export function renderMinimal(item: any) {
    return item
}

export function renderModerate(item: StableItem) {
    return html`
        <div class="card" data-id="${item.id}">
            <button onclick="${() => {}}">Action</button>
            <strong>${item.name}</strong>
            <span>${item.id}</span>
        </div>
    `
}

export function renderFilesystemLike(item: StableItem) {
    return html`
        <article class="business-asset-card" data-id="${item.id}">
            <div class="icon-area">
                <span class="icon">📁</span>
            </div>
            <div class="card-details">
                <h3 class="title">${item.name}</h3>
                <p class="description">Description for item ${item.id}</p>
                <div class="badges">
                    <span class="badge warning">Draft</span>
                    <span class="badge info">Asset</span>
                </div>
                <div class="metadata">
                    <span class="meta-label">Size:</span>
                    <span class="meta-value">2.4 MB</span>
                    <span class="meta-label">Updated:</span>
                    <span class="meta-value">2 hours ago</span>
                </div>
                <button
                    class="action-trigger"
                    onclick="${() => console.log('action clicked')}"
                >
                    Actions
                </button>
            </div>
        </article>
    `
}
