const EMAIL_DOMAIN_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/;

function getAllowedEmailDomains(): string[] {
    const configured = process.env.ALLOWED_EMAIL_DOMAINS;
    if (!configured) {
        throw new Error("ALLOWED_EMAIL_DOMAINS is not configured.");
    }

    const domains = configured
        .split(",")
        .map((domain) => domain.trim().toLowerCase().replace(/^@/, ""))
        .filter(Boolean);

    if (
        domains.length === 0 ||
        domains.some((domain) => !EMAIL_DOMAIN_PATTERN.test(domain))
    ) {
        throw new Error(
            "ALLOWED_EMAIL_DOMAINS must contain valid comma-separated domains.",
        );
    }

    return [...new Set(domains)];
}

export function isAllowedEmailDomain(email: string): boolean {
    const atIndex = email.lastIndexOf("@");
    if (atIndex <= 0 || atIndex === email.length - 1) return false;

    const domain = email.slice(atIndex + 1).toLowerCase();
    return getAllowedEmailDomains().includes(domain);
}
