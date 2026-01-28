"use client";
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CreatePostPage;
const react_1 = require("react");
const react_2 = require("next-auth/react");
const navigation_1 = require("next/navigation");
const link_1 = __importDefault(require("next/link"));
const ContentInput_1 = __importDefault(require("@/components/ContentInput"));
const Logo_1 = __importDefault(require("@/components/Logo"));
const SubscriptionPaywall_1 = __importDefault(require("@/components/SubscriptionPaywall"));
const SparklesIcon = () => (React.createElement("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.5 },
    React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" })));
const CheckIcon = () => (React.createElement("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 },
    React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M4.5 12.75l6 6 9-13.5" })));
const RefreshIcon = () => (React.createElement("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 },
    React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" })));
const UndoIcon = () => (React.createElement("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.5 },
    React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" })));
const CalendarIcon = () => (React.createElement("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 },
    React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" })));
const EditIcon = () => (React.createElement("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 },
    React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" })));
const PlusIcon = () => (React.createElement("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 },
    React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 4.5v15m7.5-7.5h-15" })));
const ImageIcon = () => (React.createElement("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.5 },
    React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" })));
const XIcon = () => (React.createElement("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 },
    React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M6 18L18 6M6 6l12 12" })));
const ChatBubbleIcon = () => (React.createElement("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.5 },
    React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" })));
const TrashIcon = () => (React.createElement("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.5 },
    React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" })));
const ChevronLeftIcon = () => (React.createElement("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 },
    React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15.75 19.5L8.25 12l7.5-7.5" })));
const ChevronRightIcon = () => (React.createElement("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 },
    React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M8.25 4.5l7.5 7.5-7.5 7.5" })));
const WandIcon = () => (React.createElement("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.5 },
    React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" })));
const BookOpenIcon = () => (React.createElement("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.5 },
    React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" })));
const LinkIcon = () => (React.createElement("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.5 },
    React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" })));
const VideoIcon = () => (React.createElement("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.5 },
    React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" })));
const DocumentIcon = () => (React.createElement("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.5 },
    React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" })));
// Helper to get next Monday at 8:55 AM
const getNextMonday = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysUntilMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 7 : 8 - dayOfWeek;
    const nextMonday = new Date(now);
    nextMonday.setDate(now.getDate() + daysUntilMonday);
    nextMonday.setHours(8, 55, 0, 0);
    return nextMonday;
};
// Animated loading indicator component
const ThinkingIndicator = () => {
    const [dots, setDots] = (0, react_1.useState)("");
    const [message, setMessage] = (0, react_1.useState)("TeamPost AI is thinking");
    const messages = [
        "TeamPost AI is thinking",
        "Crafting your story",
        "Finding the right words",
        "Polishing the message",
        "Almost there",
    ];
    (0, react_1.useEffect)(() => {
        const dotsInterval = setInterval(() => {
            setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
        }, 400);
        const messageInterval = setInterval(() => {
            setMessage((prev) => {
                const currentIndex = messages.indexOf(prev);
                return messages[(currentIndex + 1) % messages.length];
            });
        }, 3000);
        return () => {
            clearInterval(dotsInterval);
            clearInterval(messageInterval);
        };
    }, []);
    return (React.createElement("div", { className: "flex justify-start" },
        React.createElement("div", { className: "bg-claude-bg-secondary rounded-claude-lg p-4 max-w-[80%]" },
            React.createElement("div", { className: "flex items-center gap-3" },
                React.createElement("div", { className: "flex gap-1" },
                    React.createElement("div", { className: "w-2 h-2 bg-accent-coral rounded-full animate-bounce", style: { animationDelay: "0ms" } }),
                    React.createElement("div", { className: "w-2 h-2 bg-accent-coral rounded-full animate-bounce", style: { animationDelay: "150ms" } }),
                    React.createElement("div", { className: "w-2 h-2 bg-accent-coral rounded-full animate-bounce", style: { animationDelay: "300ms" } })),
                React.createElement("span", { className: "text-claude-text-secondary text-sm" },
                    message,
                    dots)))));
};
// Progress indicator showing how close to draft
const DraftProgressIndicator = ({ userMessageCount }) => {
    const stages = [
        { min: 0, label: "Share your story", hint: "Tell me what happened" },
        { min: 1, label: "Getting started", hint: "Add more details to make it engaging" },
        { min: 2, label: "Building context", hint: "What was the outcome or lesson?" },
        { min: 3, label: "Almost ready", hint: "One more detail and I can draft your post" },
        { min: 4, label: "Ready to draft!", hint: "I have enough to write your post" },
    ];
    const currentStageIndex = Math.min(userMessageCount, stages.length - 1);
    const progress = Math.min((userMessageCount / 4) * 100, 100);
    const currentStage = stages[currentStageIndex];
    if (userMessageCount >= 4) {
        return null;
    }
    return (React.createElement("div", { className: "bg-gradient-to-r from-accent-coral/5 to-accent-coral/10 border border-accent-coral/20 rounded-claude-lg p-4 mb-4" },
        React.createElement("div", { className: "flex items-center justify-between mb-2" },
            React.createElement("span", { className: "text-sm font-medium text-claude-text" }, currentStage.label),
            React.createElement("span", { className: "text-xs text-accent-coral font-medium" },
                Math.round(progress),
                "%")),
        React.createElement("div", { className: "h-2 bg-claude-bg-tertiary rounded-full overflow-hidden mb-2" },
            React.createElement("div", { className: "h-full bg-gradient-to-r from-accent-coral to-accent-coral/80 rounded-full transition-all duration-500 ease-out", style: { width: `${progress}%` } })),
        React.createElement("p", { className: "text-xs text-claude-text-secondary" }, currentStage.hint),
        React.createElement("div", { className: "flex items-center gap-2 mt-3" },
            [0, 1, 2, 3].map((stage) => (React.createElement("div", { key: stage, className: `w-2 h-2 rounded-full transition-all duration-300 ${stage < userMessageCount
                    ? "bg-accent-coral"
                    : stage === userMessageCount
                        ? "bg-accent-coral/50 animate-pulse"
                        : "bg-claude-bg-tertiary"}` }))),
            React.createElement(SparklesIcon, null))));
};
function CreatePostPage() {
    var _a, _b, _c;
    const { data: session, status } = (0, react_2.useSession)();
    const router = (0, navigation_1.useRouter)();
    const messagesEndRef = (0, react_1.useRef)(null);
    const fileInputRef = (0, react_1.useRef)(null);
    const saveTimeoutRef = (0, react_1.useRef)(null);
    const [messages, setMessages] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [draftPost, setDraftPost] = (0, react_1.useState)(null);
    const [isEditingDraft, setIsEditingDraft] = (0, react_1.useState)(false);
    const [editedContent, setEditedContent] = (0, react_1.useState)("");
    const [isScheduling, setIsScheduling] = (0, react_1.useState)(false);
    const [showScheduleSuccess, setShowScheduleSuccess] = (0, react_1.useState)(false);
    const [uploadingImage, setUploadingImage] = (0, react_1.useState)(false);
    const [scheduledTime, setScheduledTime] = (0, react_1.useState)(null);
    const [selectedScheduleDate, setSelectedScheduleDate] = (0, react_1.useState)("");
    const [selectedScheduleTime, setSelectedScheduleTime] = (0, react_1.useState)("08:55");
    // Conversation persistence state
    const [conversationId, setConversationId] = (0, react_1.useState)(null);
    const [savedConversations, setSavedConversations] = (0, react_1.useState)([]);
    const [showConversationsSidebar, setShowConversationsSidebar] = (0, react_1.useState)(true);
    const [isSaving, setIsSaving] = (0, react_1.useState)(false);
    // Subscription paywall state
    const [showPaywall, setShowPaywall] = (0, react_1.useState)(false);
    const [scheduledPostCount, setScheduledPostCount] = (0, react_1.useState)(0);
    // Photo library state
    const [libraryPhotos, setLibraryPhotos] = (0, react_1.useState)([]);
    const [showPhotoLibrary, setShowPhotoLibrary] = (0, react_1.useState)(false);
    const [photoDragActive, setPhotoDragActive] = (0, react_1.useState)(false);
    // Magic Draft state
    const [magicDraftAvailable, setMagicDraftAvailable] = (0, react_1.useState)(false);
    const [magicDraftCount, setMagicDraftCount] = (0, react_1.useState)(0);
    const [showMagicDraftModal, setShowMagicDraftModal] = (0, react_1.useState)(false);
    const [libraryItems, setLibraryItems] = (0, react_1.useState)([]);
    const [selectedLibraryItems, setSelectedLibraryItems] = (0, react_1.useState)([]);
    const [generatingMagicDraft, setGeneratingMagicDraft] = (0, react_1.useState)(false);
    // Undo/revert state
    const [previousDraftContent, setPreviousDraftContent] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        if (status === "unauthenticated") {
            router.push("/login?callbackUrl=/create");
        }
    }, [status, router]);
    (0, react_1.useEffect)(() => {
        var _a;
        (_a = messagesEndRef.current) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    // Fetch saved conversations on mount
    (0, react_1.useEffect)(() => {
        if (session === null || session === void 0 ? void 0 : session.user) {
            fetchSavedConversations();
            fetchLibraryPhotos();
            checkMagicDraftAvailability();
        }
    }, [session]);
    const checkMagicDraftAvailability = () => __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch("/api/posts/magic-draft");
            if (response.ok) {
                const data = yield response.json();
                setMagicDraftAvailable(data.available);
                setMagicDraftCount(data.count || 0);
            }
        }
        catch (error) {
            console.error("Failed to check magic draft availability:", error);
        }
    });
    const fetchLibraryItems = () => __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch("/api/personalization/library");
            if (response.ok) {
                const data = yield response.json();
                setLibraryItems(data.items.filter((i) => i.processingStatus === "COMPLETED"));
            }
        }
        catch (error) {
            console.error("Failed to fetch library items:", error);
        }
    });
    const handleOpenMagicDraft = () => __awaiter(this, void 0, void 0, function* () {
        yield fetchLibraryItems();
        setSelectedLibraryItems([]);
        setShowMagicDraftModal(true);
    });
    const handleGenerateMagicDraft = () => __awaiter(this, void 0, void 0, function* () {
        setGeneratingMagicDraft(true);
        try {
            const response = yield fetch("/api/posts/magic-draft", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    itemIds: selectedLibraryItems.length > 0 ? selectedLibraryItems : undefined,
                }),
            });
            if (response.ok) {
                const data = yield response.json();
                setDraftPost({
                    content: data.draft,
                    isApproved: false,
                });
                setShowMagicDraftModal(false);
                // Add a message about the magic draft
                const sourceNames = data.sourcedFrom.map((s) => s.title).join(", ");
                const message = {
                    id: Date.now().toString(),
                    role: "assistant",
                    content: `I've created a draft based on your library content${sourceNames ? ` (sourced from: ${sourceNames})` : ""}. Take a look and let me know if you'd like any changes!`,
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, message]);
            }
            else {
                const error = yield response.json();
                alert(error.error || "Failed to generate magic draft");
            }
        }
        catch (error) {
            console.error("Magic draft error:", error);
            alert("Failed to generate magic draft. Please try again.");
        }
        finally {
            setGeneratingMagicDraft(false);
        }
    });
    const toggleLibraryItemSelection = (id) => {
        setSelectedLibraryItems((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
    };
    const getLibraryItemIcon = (type) => {
        switch (type) {
            case "YOUTUBE":
                return React.createElement(VideoIcon, null);
            case "PDF":
            case "DOCX":
                return React.createElement(DocumentIcon, null);
            default:
                return React.createElement(LinkIcon, null);
        }
    };
    const fetchLibraryPhotos = () => __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch("/api/photos");
            if (response.ok) {
                const data = yield response.json();
                setLibraryPhotos(data.photos || []);
            }
        }
        catch (error) {
            console.error("Failed to fetch photos:", error);
        }
    });
    const handleSelectLibraryPhoto = (photo) => {
        if (draftPost) {
            setDraftPost(Object.assign(Object.assign({}, draftPost), { imageUrl: photo.imageUrl }));
        }
        setShowPhotoLibrary(false);
    };
    // Initialize schedule date/time when draft is created
    (0, react_1.useEffect)(() => {
        if (draftPost && !selectedScheduleDate) {
            const nextMonday = getNextMonday();
            setSelectedScheduleDate(nextMonday.toISOString().split("T")[0]);
            setSelectedScheduleTime("08:55");
        }
    }, [draftPost, selectedScheduleDate]);
    const fetchSavedConversations = () => __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch("/api/conversations");
            if (response.ok) {
                const data = yield response.json();
                setSavedConversations(data.conversations);
            }
        }
        catch (error) {
            console.error("Failed to fetch conversations:", error);
        }
    });
    // Auto-save conversation when messages change
    const saveConversation = (0, react_1.useCallback)((msgs, draft, convId) => __awaiter(this, void 0, void 0, function* () {
        // Only save if there are user messages
        const userMessages = msgs.filter(m => m.role === "user");
        if (userMessages.length === 0)
            return;
        setIsSaving(true);
        try {
            const response = yield fetch("/api/conversations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: convId,
                    messages: msgs.map(m => ({
                        role: m.role,
                        content: m.content,
                        timestamp: m.timestamp,
                    })),
                    draftContent: draft === null || draft === void 0 ? void 0 : draft.content,
                    draftImageUrl: draft === null || draft === void 0 ? void 0 : draft.imageUrl,
                }),
            });
            if (response.ok) {
                const data = yield response.json();
                setConversationId(data.conversation.id);
                fetchSavedConversations();
            }
        }
        catch (error) {
            console.error("Failed to save conversation:", error);
        }
        finally {
            setIsSaving(false);
        }
    }), []);
    // Debounced auto-save
    (0, react_1.useEffect)(() => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        // Only auto-save if there are user messages and not approved
        const userMessages = messages.filter(m => m.role === "user");
        if (userMessages.length > 0 && !(draftPost === null || draftPost === void 0 ? void 0 : draftPost.isApproved)) {
            saveTimeoutRef.current = setTimeout(() => {
                saveConversation(messages, draftPost, conversationId);
            }, 2000); // Save after 2 seconds of inactivity
        }
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [messages, draftPost, conversationId, saveConversation]);
    // Load a saved conversation
    const loadConversation = (id) => __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`/api/conversations/${id}`);
            if (response.ok) {
                const data = yield response.json();
                const conv = data.conversation;
                // Restore messages
                const restoredMessages = conv.messages.map((m, i) => ({
                    id: `restored-${i}`,
                    role: m.role,
                    content: m.content,
                    timestamp: new Date(m.timestamp),
                }));
                setMessages(restoredMessages);
                setConversationId(conv.id);
                // Restore draft if exists
                if (conv.draftContent) {
                    setDraftPost({
                        content: conv.draftContent,
                        imageUrl: conv.draftImageUrl || undefined,
                        isApproved: false,
                    });
                }
                else {
                    setDraftPost(null);
                }
                setShowScheduleSuccess(false);
                setScheduledTime(null);
                setPreviousDraftContent(null);
            }
        }
        catch (error) {
            console.error("Failed to load conversation:", error);
        }
    });
    // Delete a conversation
    const deleteConversation = (id, e) => __awaiter(this, void 0, void 0, function* () {
        e.stopPropagation();
        if (!confirm("Delete this conversation?"))
            return;
        try {
            const response = yield fetch(`/api/conversations/${id}`, {
                method: "DELETE",
            });
            if (response.ok) {
                setSavedConversations(prev => prev.filter(c => c.id !== id));
                if (conversationId === id) {
                    handleStartNew();
                }
            }
        }
        catch (error) {
            console.error("Failed to delete conversation:", error);
        }
    });
    // Initial greeting
    (0, react_1.useEffect)(() => {
        var _a;
        if (messages.length === 0 && status === "authenticated" && !conversationId) {
            setMessages([
                {
                    id: "welcome",
                    role: "assistant",
                    content: `Hey${((_a = session === null || session === void 0 ? void 0 : session.user) === null || _a === void 0 ? void 0 : _a.name) ? ` ${session.user.name.split(" ")[0]}` : ""}! I'm your LinkedIn ghostwriter.

What's on your mind? Share a story, an idea, or something that happened recently that you want to turn into a post.

You can type or record a voice note - whatever feels more natural.`,
                    timestamp: new Date(),
                },
            ]);
        }
    }, [status, session, messages.length, conversationId]);
    const handleSubmit = (content, isVoice) => __awaiter(this, void 0, void 0, function* () {
        const userMessage = {
            id: Date.now().toString(),
            role: "user",
            content,
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);
        try {
            const conversationHistory = [...messages, userMessage].map((m) => ({
                role: m.role,
                content: m.content,
            }));
            const response = yield fetch("/api/conversation/respond", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: conversationHistory,
                    hasDraft: !!draftPost,
                }),
            });
            if (!response.ok) {
                throw new Error("Failed to get response");
            }
            const data = yield response.json();
            const assistantMessage = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: data.message,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, assistantMessage]);
            if (data.draft) {
                setDraftPost({
                    content: data.draft,
                    isApproved: false,
                });
            }
        }
        catch (error) {
            console.error("Error:", error);
            const errorMessage = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "Sorry, something went wrong. Please try again.",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        }
        finally {
            setIsLoading(false);
        }
    });
    const handleRegenerateDraft = () => __awaiter(this, void 0, void 0, function* () {
        if (!draftPost)
            return;
        // Save current content before regenerating for undo functionality
        setPreviousDraftContent(draftPost.content);
        setIsLoading(true);
        try {
            const response = yield fetch("/api/conversation/regenerate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentDraft: draftPost.content,
                    messages: messages.map((m) => ({ role: m.role, content: m.content })),
                }),
            });
            if (response.ok) {
                const data = yield response.json();
                setDraftPost({
                    content: data.draft,
                    imageUrl: draftPost.imageUrl,
                    isApproved: false,
                });
                const message = {
                    id: Date.now().toString(),
                    role: "assistant",
                    content: "Here's a fresh take on your post. What do you think?",
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, message]);
            }
            else {
                // Clear previous version if regeneration failed
                setPreviousDraftContent(null);
            }
        }
        catch (error) {
            console.error("Error regenerating:", error);
            // Clear previous version if regeneration failed
            setPreviousDraftContent(null);
        }
        finally {
            setIsLoading(false);
        }
    });
    const handleRevertToPrevious = () => {
        if (!previousDraftContent || !draftPost)
            return;
        setDraftPost(Object.assign(Object.assign({}, draftPost), { content: previousDraftContent }));
        // Clear the previous version after reverting
        setPreviousDraftContent(null);
        const message = {
            id: Date.now().toString(),
            role: "assistant",
            content: "I've restored the previous version of your draft.",
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, message]);
    };
    const handleSaveEdit = () => {
        if (draftPost && editedContent.trim()) {
            setDraftPost(Object.assign(Object.assign({}, draftPost), { content: editedContent.trim() }));
        }
        setIsEditingDraft(false);
    };
    const handleImageUpload = (e) => __awaiter(this, void 0, void 0, function* () {
        var _a;
        const file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (!file)
            return;
        // Client-side validation
        if (!file.type.startsWith("image/")) {
            alert("Please select an image file (JPEG, PNG, GIF, or WebP)");
            if (fileInputRef.current)
                fileInputRef.current.value = "";
            return;
        }
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            alert("Image is too large. Maximum size is 10MB.");
            if (fileInputRef.current)
                fileInputRef.current.value = "";
            return;
        }
        if (file.size === 0) {
            alert("The selected file appears to be empty. Please try another image.");
            if (fileInputRef.current)
                fileInputRef.current.value = "";
            return;
        }
        setUploadingImage(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const response = yield fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
            const result = yield response.json();
            if (!response.ok) {
                throw new Error(result.error || "Failed to upload image");
            }
            if (!result.imageUrl) {
                throw new Error("No image URL returned from upload");
            }
            if (draftPost) {
                setDraftPost(Object.assign(Object.assign({}, draftPost), { imageUrl: result.imageUrl }));
            }
        }
        catch (error) {
            console.error("Upload error:", error);
            const message = error instanceof Error ? error.message : "Failed to upload image";
            alert(`Upload failed: ${message}`);
        }
        finally {
            setUploadingImage(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    });
    const handleRemoveImage = () => {
        if (draftPost) {
            setDraftPost(Object.assign(Object.assign({}, draftPost), { imageUrl: undefined }));
        }
    };
    const uploadPhotoFile = (file) => __awaiter(this, void 0, void 0, function* () {
        if (!file.type.startsWith("image/")) {
            alert("Please select an image file (JPEG, PNG, GIF, or WebP)");
            return;
        }
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            alert("Image is too large. Maximum size is 10MB.");
            return;
        }
        setUploadingImage(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const response = yield fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
            const result = yield response.json();
            if (!response.ok) {
                throw new Error(result.error || "Failed to upload image");
            }
            if (!result.imageUrl) {
                throw new Error("No image URL returned from upload");
            }
            if (draftPost) {
                setDraftPost(Object.assign(Object.assign({}, draftPost), { imageUrl: result.imageUrl }));
            }
        }
        catch (error) {
            console.error("Upload error:", error);
            const message = error instanceof Error ? error.message : "Failed to upload image";
            alert(`Upload failed: ${message}`);
        }
        finally {
            setUploadingImage(false);
        }
    });
    const handlePhotoDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setPhotoDragActive(true);
        }
        else if (e.type === "dragleave") {
            setPhotoDragActive(false);
        }
    };
    const handlePhotoDrop = (e) => __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
        e.stopPropagation();
        setPhotoDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            yield uploadPhotoFile(e.dataTransfer.files[0]);
        }
    });
    const handleSchedulePost = () => __awaiter(this, void 0, void 0, function* () {
        if (!draftPost || !selectedScheduleDate || !selectedScheduleTime)
            return;
        setIsScheduling(true);
        try {
            const saveResponse = yield fetch("/api/posts/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: draftPost.content,
                    imageUrl: draftPost.imageUrl,
                    conversationHistory: messages.map((m) => ({
                        role: m.role,
                        content: m.content,
                    })),
                }),
            });
            if (!saveResponse.ok) {
                throw new Error("Failed to save post");
            }
            const { postId } = yield saveResponse.json();
            // Use the user-selected date/time
            const scheduledFor = new Date(`${selectedScheduleDate}T${selectedScheduleTime}:00`);
            const scheduleResponse = yield fetch("/api/schedule/next", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    postId,
                    scheduledFor: scheduledFor.toISOString(),
                    imageUrl: draftPost.imageUrl,
                }),
            });
            if (scheduleResponse.ok) {
                const scheduleData = yield scheduleResponse.json();
                setScheduledTime(scheduleData.scheduledFor || scheduledFor.toISOString());
                setShowScheduleSuccess(true);
                setDraftPost(Object.assign(Object.assign({}, draftPost), { isApproved: true }));
                // Mark conversation as completed
                if (conversationId) {
                    yield fetch(`/api/conversations/${conversationId}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ status: "COMPLETED" }),
                    });
                    fetchSavedConversations();
                }
                const message = {
                    id: Date.now().toString(),
                    role: "assistant",
                    content: "Your post is scheduled! Want to create another one?",
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, message]);
            }
            else if (scheduleResponse.status === 402) {
                // Subscription required
                const errorData = yield scheduleResponse.json();
                setScheduledPostCount(errorData.scheduledPostCount || 10);
                setShowPaywall(true);
            }
            else {
                throw new Error("Failed to schedule post");
            }
        }
        catch (error) {
            console.error("Error scheduling:", error);
            alert("Failed to schedule post. Please try again.");
        }
        finally {
            setIsScheduling(false);
        }
    });
    const handleStartNew = () => {
        setMessages([
            {
                id: "welcome-new",
                role: "assistant",
                content: "Let's create another post! What do you want to talk about?",
                timestamp: new Date(),
            },
        ]);
        setDraftPost(null);
        setShowScheduleSuccess(false);
        setScheduledTime(null);
        setConversationId(null);
        setPreviousDraftContent(null);
    };
    if (status === "loading") {
        return (React.createElement("div", { className: "min-h-screen bg-claude-bg flex items-center justify-center" },
            React.createElement("div", { className: "animate-spin w-8 h-8 border-2 border-accent-coral border-t-transparent rounded-full" })));
    }
    const formatTimeAgo = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        if (diffMins < 1)
            return "Just now";
        if (diffMins < 60)
            return `${diffMins}m ago`;
        if (diffHours < 24)
            return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };
    return (React.createElement("div", { className: "min-h-screen bg-claude-bg flex flex-col" },
        React.createElement("header", { className: "sticky top-0 bg-claude-bg/80 backdrop-blur-md border-b border-claude-border z-50" },
            React.createElement("div", { className: "max-w-6xl mx-auto px-6 h-16 flex items-center justify-between" },
                React.createElement(link_1.default, { href: "/dashboard", className: "flex items-center gap-2" },
                    React.createElement(Logo_1.default, { size: "md" })),
                React.createElement("div", { className: "flex items-center gap-3" },
                    isSaving && (React.createElement("span", { className: "text-xs text-claude-text-tertiary flex items-center gap-1" },
                        React.createElement("div", { className: "w-2 h-2 bg-accent-coral rounded-full animate-pulse" }),
                        "Saving...")),
                    React.createElement(link_1.default, { href: "/posts", className: "btn-ghost text-sm" }, "My Posts"),
                    React.createElement(link_1.default, { href: "/schedule", className: "btn-ghost text-sm" }, "Schedule")))),
        React.createElement("div", { className: "flex-1 flex" },
            React.createElement("div", { className: `${showConversationsSidebar ? "w-64" : "w-0"} border-r border-claude-border bg-claude-bg-secondary transition-all duration-300 overflow-hidden flex-shrink-0` },
                React.createElement("div", { className: "w-64 h-full flex flex-col" },
                    React.createElement("div", { className: "p-4 border-b border-claude-border space-y-2" },
                        React.createElement("button", { onClick: handleStartNew, className: "btn-primary w-full text-sm" },
                            React.createElement(PlusIcon, null),
                            "New Post"),
                        magicDraftAvailable && (React.createElement("button", { onClick: handleOpenMagicDraft, className: "w-full text-sm px-4 py-2.5 rounded-claude font-medium transition-colors flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500/10 to-accent-coral/10 text-purple-600 border border-purple-500/20 hover:from-purple-500/20 hover:to-accent-coral/20" },
                            React.createElement(WandIcon, null),
                            "Magic Draft",
                            React.createElement("span", { className: "text-xs bg-purple-500/20 px-1.5 py-0.5 rounded-full" }, magicDraftCount)))),
                    React.createElement("div", { className: "flex-1 overflow-y-auto" }, savedConversations.length > 0 ? (React.createElement("div", { className: "p-2" },
                        React.createElement("p", { className: "text-xs text-claude-text-tertiary px-2 py-1 font-medium uppercase tracking-wide" }, "In Progress"),
                        savedConversations.map((conv) => (React.createElement("div", { key: conv.id, onClick: () => loadConversation(conv.id), className: `group p-3 rounded-lg cursor-pointer transition-colors mb-1 ${conversationId === conv.id
                                ? "bg-accent-coral/10 border border-accent-coral/20"
                                : "hover:bg-claude-bg-tertiary"}` },
                            React.createElement("div", { className: "flex items-start justify-between gap-2" },
                                React.createElement("div", { className: "flex-1 min-w-0" },
                                    React.createElement("p", { className: "text-sm text-claude-text truncate font-medium" }, conv.title),
                                    React.createElement("p", { className: "text-xs text-claude-text-tertiary mt-0.5" }, formatTimeAgo(conv.updatedAt)),
                                    conv.draftContent && (React.createElement("div", { className: "flex items-center gap-1 mt-1" },
                                        React.createElement(SparklesIcon, null),
                                        React.createElement("span", { className: "text-xs text-accent-coral" }, "Draft ready")))),
                                React.createElement("button", { onClick: (e) => deleteConversation(conv.id, e), className: "opacity-0 group-hover:opacity-100 p-1 text-claude-text-tertiary hover:text-error transition-all" },
                                    React.createElement(TrashIcon, null)))))))) : (React.createElement("div", { className: "p-4 text-center" },
                        React.createElement(ChatBubbleIcon, null),
                        React.createElement("p", { className: "text-sm text-claude-text-tertiary mt-2" }, "No conversations yet"),
                        React.createElement("p", { className: "text-xs text-claude-text-tertiary mt-1" }, "Start chatting to create a post")))))),
            React.createElement("button", { onClick: () => setShowConversationsSidebar(!showConversationsSidebar), className: "absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-claude-bg-secondary border border-claude-border rounded-r-lg p-1 hover:bg-claude-bg-tertiary transition-colors", style: { left: showConversationsSidebar ? "256px" : "0" } }, showConversationsSidebar ? React.createElement(ChevronLeftIcon, null) : React.createElement(ChevronRightIcon, null)),
            React.createElement("div", { className: "flex-1 flex max-w-4xl mx-auto w-full" },
                React.createElement("div", { className: "flex-1 flex flex-col" },
                    React.createElement("div", { className: "flex-1 overflow-y-auto p-6 space-y-4" },
                        !draftPost && (React.createElement(DraftProgressIndicator, { userMessageCount: messages.filter((m) => m.role === "user").length })),
                        messages.map((message) => (React.createElement("div", { key: message.id, className: `flex ${message.role === "user" ? "justify-end" : "justify-start"}` },
                            React.createElement("div", { className: `max-w-[80%] rounded-claude-lg p-4 ${message.role === "user"
                                    ? "bg-accent-coral text-white"
                                    : "bg-claude-bg-secondary text-claude-text"}` },
                                React.createElement("p", { className: "whitespace-pre-wrap" }, message.content))))),
                        isLoading && React.createElement(ThinkingIndicator, null),
                        draftPost && !draftPost.isApproved && (React.createElement("div", { className: "bg-gradient-to-r from-accent-coral/10 to-accent-coral/5 border border-accent-coral/30 rounded-claude-lg p-4 my-4" },
                            React.createElement("div", { className: "flex items-center gap-3" },
                                React.createElement("div", { className: "w-10 h-10 rounded-full bg-accent-coral/20 flex items-center justify-center flex-shrink-0" },
                                    React.createElement(SparklesIcon, null)),
                                React.createElement("div", { className: "flex-1" },
                                    React.createElement("p", { className: "font-medium text-claude-text" }, "Your draft is ready!"),
                                    React.createElement("p", { className: "text-sm text-claude-text-secondary" }, "Check the preview panel on the right to review, edit, or schedule your post.")),
                                React.createElement("button", { onClick: () => {
                                        // Scroll to top of draft panel on mobile or highlight it
                                        const draftPanel = document.querySelector('[data-draft-panel]');
                                        if (draftPanel) {
                                            draftPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                        }
                                    }, className: "btn-primary text-sm px-4 py-2 flex-shrink-0" }, "View Draft")),
                            React.createElement("div", { className: "mt-4 p-3 bg-white rounded-claude border border-claude-border" },
                                React.createElement("p", { className: "text-xs text-claude-text-tertiary mb-2 font-medium" }, "PREVIEW"),
                                React.createElement("p", { className: "text-sm text-claude-text line-clamp-4 whitespace-pre-wrap" }, draftPost.content),
                                draftPost.content.length > 200 && (React.createElement("p", { className: "text-xs text-accent-coral mt-2" }, "...see full draft in panel"))))),
                        React.createElement("div", { ref: messagesEndRef })),
                    React.createElement("div", { className: "p-6 border-t border-claude-border" },
                        React.createElement(ContentInput_1.default, { onSubmit: handleSubmit, disabled: isLoading, placeholder: draftPost
                                ? "Tell me what to change, or say 'looks good' to approve..."
                                : "Share your idea, story, or thought...", autoFocus: true }))),
                draftPost && (React.createElement("div", { "data-draft-panel": true, className: "w-96 border-l border-claude-border p-6 overflow-y-auto" },
                    React.createElement("div", { className: "sticky top-0" },
                        React.createElement("div", { className: "flex items-center justify-between mb-4" },
                            React.createElement("h2", { className: "font-semibold text-claude-text flex items-center gap-2" },
                                React.createElement(SparklesIcon, null),
                                "Your Draft"),
                            draftPost.isApproved && (React.createElement("span", { className: "text-xs bg-success/10 text-success px-2 py-1 rounded-full" }, "Scheduled"))),
                        React.createElement("div", { className: "bg-white rounded-claude border border-claude-border p-4 mb-4" },
                            React.createElement("div", { className: "flex items-center gap-3 mb-3" },
                                React.createElement("div", { className: "w-10 h-10 rounded-full bg-claude-bg-tertiary flex items-center justify-center" },
                                    React.createElement("span", { className: "text-sm font-medium text-claude-text" }, ((_b = (_a = session === null || session === void 0 ? void 0 : session.user) === null || _a === void 0 ? void 0 : _a.name) === null || _b === void 0 ? void 0 : _b[0]) || "U")),
                                React.createElement("div", null,
                                    React.createElement("p", { className: "font-medium text-claude-text text-sm" }, ((_c = session === null || session === void 0 ? void 0 : session.user) === null || _c === void 0 ? void 0 : _c.name) || "Your Name"),
                                    React.createElement("p", { className: "text-xs text-claude-text-tertiary" }, "Draft for LinkedIn"))),
                            isEditingDraft ? (React.createElement("textarea", { value: editedContent, onChange: (e) => setEditedContent(e.target.value), className: "w-full h-64 p-2 border border-claude-border rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent-coral" })) : (React.createElement("div", { className: "whitespace-pre-wrap text-sm text-claude-text" }, draftPost.content)),
                            !isEditingDraft && (React.createElement("div", { className: "mt-4" }, draftPost.imageUrl ? (React.createElement("div", { className: "relative" },
                                React.createElement("img", { src: draftPost.imageUrl, alt: "Post image", className: "w-full rounded-lg border border-claude-border" }),
                                !draftPost.isApproved && (React.createElement("button", { onClick: handleRemoveImage, className: "absolute top-2 right-2 w-6 h-6 bg-error text-white rounded-full flex items-center justify-center hover:bg-error/80" },
                                    React.createElement(XIcon, null))))) : !draftPost.isApproved && (React.createElement("div", { onDragEnter: handlePhotoDrag, onDragLeave: handlePhotoDrag, onDragOver: handlePhotoDrag, onDrop: handlePhotoDrop, className: `border-2 border-dashed rounded-lg p-4 transition-colors ${photoDragActive
                                    ? "border-accent-coral bg-accent-coral/10"
                                    : "border-accent-coral/30 bg-accent-coral/5"}` },
                                React.createElement("input", { ref: fileInputRef, type: "file", accept: "image/*", onChange: handleImageUpload, className: "hidden" }),
                                photoDragActive ? (React.createElement("div", { className: "flex items-center justify-center py-4" },
                                    React.createElement("p", { className: "text-accent-coral font-medium" }, "Drop your photo here"))) : showPhotoLibrary ? (React.createElement("div", null,
                                    React.createElement("div", { className: "flex items-center justify-between mb-3" },
                                        React.createElement("p", { className: "text-sm font-medium text-claude-text" }, "Your Photo Library"),
                                        React.createElement("button", { onClick: () => setShowPhotoLibrary(false), className: "text-xs text-claude-text-tertiary hover:text-claude-text" }, "Cancel")),
                                    libraryPhotos.length > 0 ? (React.createElement("div", { className: "grid grid-cols-3 gap-2 max-h-48 overflow-y-auto" }, libraryPhotos.map((photo) => (React.createElement("button", { key: photo.id, onClick: () => handleSelectLibraryPhoto(photo), className: "aspect-square rounded overflow-hidden border-2 border-transparent hover:border-accent-coral transition-colors" },
                                        React.createElement("img", { src: photo.imageUrl, alt: photo.filename || "Photo", className: "w-full h-full object-cover" })))))) : (React.createElement("p", { className: "text-xs text-claude-text-tertiary text-center py-4" }, "No photos in your library yet. Upload some from your dashboard.")),
                                    React.createElement("div", { className: "mt-3 pt-3 border-t border-claude-border" },
                                        React.createElement("button", { onClick: () => { var _a; return (_a = fileInputRef.current) === null || _a === void 0 ? void 0 : _a.click(); }, className: "text-xs text-accent-coral hover:underline" }, "Or upload a new photo")))) : (React.createElement("div", { className: "text-center" }, uploadingImage ? (React.createElement("div", { className: "flex items-center justify-center gap-2 text-claude-text-secondary py-2" },
                                    React.createElement("div", { className: "animate-spin w-4 h-4 border-2 border-accent-coral border-t-transparent rounded-full" }),
                                    "Uploading...")) : (React.createElement(React.Fragment, null,
                                    React.createElement("p", { className: "text-xs text-claude-text-secondary mb-2" },
                                        "Posts with photos perform ",
                                        React.createElement("span", { className: "font-semibold text-accent-coral" }, "2x better")),
                                    React.createElement("div", { className: "flex gap-2 justify-center" },
                                        libraryPhotos.length > 0 && (React.createElement("button", { onClick: () => setShowPhotoLibrary(true), className: "px-3 py-1.5 text-xs font-medium text-accent-coral bg-white border border-accent-coral/30 rounded-claude hover:bg-accent-coral/5 transition-colors" },
                                            "From Library (",
                                            libraryPhotos.length,
                                            ")")),
                                        React.createElement("button", { onClick: () => { var _a; return (_a = fileInputRef.current) === null || _a === void 0 ? void 0 : _a.click(); }, className: "px-3 py-1.5 text-xs font-medium text-white bg-accent-coral rounded-claude hover:bg-accent-coral/90 transition-colors flex items-center gap-1" },
                                            React.createElement(ImageIcon, null),
                                            "Upload Photo")),
                                    React.createElement("p", { className: "text-xs text-claude-text-tertiary mt-2" }, "Raw, authentic photos work best")))))))))),
                        !draftPost.isApproved && (React.createElement("div", { className: "space-y-3" }, isEditingDraft ? (React.createElement("div", { className: "flex gap-2" },
                            React.createElement("button", { onClick: handleSaveEdit, className: "btn-primary flex-1 text-sm" }, "Save Changes"),
                            React.createElement("button", { onClick: () => setIsEditingDraft(false), className: "btn-ghost text-sm" }, "Cancel"))) : (React.createElement(React.Fragment, null,
                            React.createElement("div", { className: "p-3 bg-claude-bg-secondary rounded-claude border border-claude-border" },
                                React.createElement("p", { className: "text-xs font-medium text-claude-text mb-2 flex items-center gap-1" },
                                    React.createElement(CalendarIcon, null),
                                    "Schedule for"),
                                React.createElement("div", { className: "flex gap-2" },
                                    React.createElement("input", { type: "date", value: selectedScheduleDate, onChange: (e) => setSelectedScheduleDate(e.target.value), min: new Date().toISOString().split("T")[0], className: "flex-1 px-3 py-2 text-sm border border-claude-border rounded-claude bg-white focus:outline-none focus:ring-2 focus:ring-accent-coral" }),
                                    React.createElement("input", { type: "time", value: selectedScheduleTime, onChange: (e) => setSelectedScheduleTime(e.target.value), className: "min-w-[120px] px-3 py-2 text-sm border border-claude-border rounded-claude bg-white focus:outline-none focus:ring-2 focus:ring-accent-coral" }))),
                            React.createElement("button", { onClick: handleSchedulePost, disabled: isScheduling || !selectedScheduleDate || !selectedScheduleTime, className: "btn-primary w-full" }, isScheduling ? (React.createElement(React.Fragment, null,
                                React.createElement("div", { className: "animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" }),
                                "Scheduling...")) : (React.createElement(React.Fragment, null,
                                React.createElement(CalendarIcon, null),
                                "Approve & Schedule"))),
                            React.createElement("div", { className: "flex gap-2" },
                                React.createElement("button", { onClick: () => {
                                        setIsEditingDraft(true);
                                        setEditedContent(draftPost.content);
                                    }, className: "btn-ghost flex-1 text-sm" },
                                    React.createElement(EditIcon, null),
                                    "Edit"),
                                React.createElement("button", { onClick: handleRegenerateDraft, disabled: isLoading, className: "btn-ghost flex-1 text-sm" },
                                    React.createElement(RefreshIcon, null),
                                    "New Version")),
                            previousDraftContent && (React.createElement("button", { onClick: handleRevertToPrevious, className: "w-full text-sm px-4 py-2.5 rounded-claude font-medium transition-colors flex items-center justify-center gap-2 bg-accent-coral/10 text-accent-coral border border-accent-coral/20 hover:bg-accent-coral/20" },
                                React.createElement(UndoIcon, null),
                                "Undo - Restore Previous Version")))))),
                        showScheduleSuccess && (React.createElement("div", { className: "mt-4 p-4 bg-success/10 border border-success/20 rounded-claude" },
                            React.createElement("div", { className: "flex items-center gap-2 text-success mb-2" },
                                React.createElement(CheckIcon, null),
                                React.createElement("span", { className: "font-medium" }, "Post Scheduled!")),
                            React.createElement("p", { className: "text-sm text-claude-text-secondary mb-3" }, scheduledTime ? (React.createElement(React.Fragment, null,
                                "Your post will go live on",
                                " ",
                                new Date(scheduledTime).toLocaleDateString("en-US", {
                                    weekday: "long",
                                    month: "short",
                                    day: "numeric",
                                    hour: "numeric",
                                    minute: "2-digit",
                                }),
                                ".")) : ("Your post will go live on the next available Monday at 8:55 AM EST.")),
                            React.createElement("button", { onClick: handleStartNew, className: "btn-primary w-full text-sm" },
                                React.createElement(PlusIcon, null),
                                "Create Another Post")))))))),
        React.createElement("input", { ref: fileInputRef, type: "file", accept: "image/*", onChange: handleImageUpload, className: "hidden" }),
        showPaywall && (React.createElement(SubscriptionPaywall_1.default, { scheduledPostCount: scheduledPostCount, onClose: () => setShowPaywall(false) })),
        showMagicDraftModal && (React.createElement("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" },
            React.createElement("div", { className: "bg-white rounded-claude-lg max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col" },
                React.createElement("div", { className: "p-6 border-b border-claude-border" },
                    React.createElement("div", { className: "flex items-center justify-between" },
                        React.createElement("div", { className: "flex items-center gap-3" },
                            React.createElement("div", { className: "w-10 h-10 rounded-full bg-gradient-to-r from-purple-500/20 to-accent-coral/20 flex items-center justify-center" },
                                React.createElement(WandIcon, null)),
                            React.createElement("div", null,
                                React.createElement("h2", { className: "text-lg font-semibold text-claude-text" }, "Magic Draft"),
                                React.createElement("p", { className: "text-sm text-claude-text-secondary" }, "Generate a post from your library"))),
                        React.createElement("button", { onClick: () => setShowMagicDraftModal(false), className: "p-2 text-claude-text-tertiary hover:text-claude-text rounded-claude hover:bg-claude-bg-secondary" },
                            React.createElement(XIcon, null)))),
                React.createElement("div", { className: "flex-1 overflow-y-auto p-6" }, libraryItems.length === 0 ? (React.createElement("div", { className: "text-center py-8" },
                    React.createElement(BookOpenIcon, null),
                    React.createElement("p", { className: "text-claude-text-secondary mt-2" }, "No library items available"),
                    React.createElement("p", { className: "text-sm text-claude-text-tertiary mt-1" }, "Add content to your library from the dashboard to use Magic Draft"))) : (React.createElement(React.Fragment, null,
                    React.createElement("p", { className: "text-sm text-claude-text-secondary mb-4" }, "Select specific items to draw from, or leave unselected for a random mix:"),
                    React.createElement("div", { className: "space-y-2" }, libraryItems.map((item) => (React.createElement("button", { key: item.id, onClick: () => toggleLibraryItemSelection(item.id), className: `w-full p-3 rounded-claude border text-left transition-all ${selectedLibraryItems.includes(item.id)
                            ? "border-purple-500 bg-purple-500/5"
                            : "border-claude-border hover:border-claude-border-hover"}` },
                        React.createElement("div", { className: "flex items-start gap-3" },
                            React.createElement("div", { className: `w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${selectedLibraryItems.includes(item.id)
                                    ? "bg-purple-500 text-white"
                                    : "bg-claude-bg-tertiary text-claude-text-secondary"}` }, getLibraryItemIcon(item.type)),
                            React.createElement("div", { className: "flex-1 min-w-0" },
                                React.createElement("p", { className: "font-medium text-claude-text text-sm truncate" }, item.title || item.fileName || item.sourceUrl || "Untitled"),
                                item.extractedSummary && (React.createElement("p", { className: "text-xs text-claude-text-tertiary mt-1 line-clamp-2" }, item.extractedSummary)),
                                React.createElement("span", { className: "inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-claude-bg-secondary text-claude-text-tertiary" }, item.type)),
                            selectedLibraryItems.includes(item.id) && (React.createElement(CheckIcon, null)))))))))),
                React.createElement("div", { className: "p-6 border-t border-claude-border bg-claude-bg-secondary" },
                    React.createElement("button", { onClick: handleGenerateMagicDraft, disabled: generatingMagicDraft || libraryItems.length === 0, className: "btn-primary w-full" }, generatingMagicDraft ? (React.createElement(React.Fragment, null,
                        React.createElement("div", { className: "animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" }),
                        "Generating...")) : (React.createElement(React.Fragment, null,
                        React.createElement(WandIcon, null),
                        selectedLibraryItems.length > 0
                            ? `Generate from ${selectedLibraryItems.length} item${selectedLibraryItems.length > 1 ? "s" : ""}`
                            : "Generate Random Draft"))),
                    selectedLibraryItems.length === 0 && libraryItems.length > 0 && (React.createElement("p", { className: "text-xs text-claude-text-tertiary text-center mt-2" },
                        "Will randomly select from your ",
                        libraryItems.length,
                        " library items"))))))));
}
