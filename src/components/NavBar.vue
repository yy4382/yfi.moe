<template>
    <div class="navbar bg-base-100 rounded-b-lg border-base-content/20 border-b-2 border-l-2 border-r-2">
        <div class="navbar-start">
            <div class="dropdown">
                <div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" />
                    </svg>
                </div>
                <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                    <li v-for="button in buttons" :key="button.text">
                        <a :href="button.link">{{ button.text }}</a>
                        <ul v-if="button.subButtons" class="p-2">
                            <li v-for="subButton in button.subButtons" :key="subButton.text">
                                <a :href="subButton.link">{{ subButton.text }}</a>
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
            <a class="btn btn-ghost text-xl">{{ siteName }}</a>
        </div>
        <div class="navbar-center hidden lg:flex">
            <ul class="menu menu-horizontal px-1">
                <li v-for="button in buttons" :key="button.text">
                    <a v-if="!button.subButtons" :href="button.link">{{ button.text }}</a>
                    <details v-else>
                        <summary>{{ button.text }}</summary>
                        <ul class="p-2 bg-base-300" style="margin-top: 0.5rem !important;">
                            <li v-for="subButton in button.subButtons" :key="subButton.text">
                                <a class="whitespace-nowrap" :href="subButton.link">{{ subButton.text }}</a>
                            </li>
                        </ul>
                    </details>
                </li>
            </ul>
        </div>
        <div class="navbar-end">
            <slot name="ThemeControl" />
        </div>
    </div>
</template>

<script setup lang="ts">
const siteName = "Yunfi's Blog"
interface Buttons{
    text: string;
    link: string;
    subButtons?: Buttons[];
}
const buttons:Buttons[] = [
    {
        text: "Home",
        link: "/",
    },
    {
        text: "Achieve",
        link: "/achieve",
    },
    {
        text: "Tags",
        link: "/tags",
    },
    {
        text: "About",
        link: "/about",
        subButtons: [
            {
                text: "Me",
                link: "/about/me",
            },
            {
                text: "About Blog",
                link: "/about/blog",
            },
        ],
    },
];
</script>